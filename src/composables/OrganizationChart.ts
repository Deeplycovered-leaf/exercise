import * as d3 from 'd3'

export class OrganizationChart {
  originTreeData: any
  el: string
  nodeClickEvent: (event: Event, data: any) => void
  config: { dx: number; dy: number; width: number; height: number; rectWidth: number; rectHeight: number }
  svg: null | d3.Selection<SVGSVGElement, undefined, null, undefined>
  gAll: null | d3.Selection<SVGGElement, undefined, null, undefined>
  gLinks: null | d3.Selection<SVGGElement, undefined, null, undefined>
  gNodes: null | d3.Selection<SVGGElement, undefined, null, undefined>
  tree: any
  data: any
  /**
 * Constructs a new instance of the TreeChart class.
 * @param options - The options for the TreeChart.
 * @param options.originTreeData - The source data for the tree.
 * @param options.el - The selector for the host element.
 * @param options.nodeClickEvent - The event handler for node click.
 * @param options.config - The configuration options for the chart.
 * @param options.config.dx - The horizontal distance between nodes.
 * @param options.config.dy - The vertical distance between nodes.
 * @param options.config.width - The width of the SVG viewBox.
 * @param options.config.height - The height of the SVG viewBox.
 * @param options.config.rectWidth - The width of the node rectangle.
 * @param options.config.rectHeight - The height of the node rectangle.
 */
  constructor(options: {
    originTreeData: any
    el: string
    nodeClickEvent?: (event: Event, data: any) => void
    config: {
      dx: number
      dy: number
      width: number
      height: number
      rectWidth: number
      rectHeight: number
    }
  }) {
    this.originTreeData = options.originTreeData
    this.el = options.el
    this.nodeClickEvent = options.nodeClickEvent || function (e, d) {
      // eslint-disable-next-line no-alert
      alert(d.fullName)
    }
    this.config = {
      dx: options.config.dx,
      dy: options.config.dy,
      width: options.config.width,
      height: options.config.height,
      rectWidth: options.config.rectWidth,
      rectHeight: options.config.rectHeight,
    }
    this.svg = null
    this.gAll = null
    this.gLinks = null
    this.gNodes = null
    this.tree = null
    this.data = null

    this.drawChart({
      type: 'all',
    })
  }

  // 初始化树结构数据
  drawChart(options: { type: any }) {
    // 宿主元素的d3选择器对象
    const container = this.initContainer()

    this.clearSvg()

    const svg = this.initSvg()

    // 包括连接线和节点的总集合
    const gAll = svg.append('g').attr('id', 'all')

    this.onZoom(svg, gAll)// 取消默认的双击放大事件

    this.gAll = gAll
    // 连接线集合
    this.gLinks = gAll.append('g').attr('id', 'linkGroup')
    // 节点集合
    this.gNodes = gAll.append('g').attr('id', 'nodeGroup')
    // 设置好节点之间距离的tree方法
    this.tree = d3.tree().nodeSize([this.config.dx, this.config.dy])

    this.setExpandState(options)
    this.createArrow(svg)

    this.svg = svg

    this.update()
    // 将svg置入宿主元素中
    container.append(() => svg.node())
  }

  initContainer() {
    const container = d3.select(this.el)
    // 宿主元素的DOM，通过node()获取到其DOM元素对象
    const dom = container.node()
    // 宿主元素的DOMRect
    const domRect = (dom as Element)?.getBoundingClientRect()
    // svg的宽度和高度
    this.config.width = domRect.width
    this.config.height = domRect.height

    return container
  }

  // 更新数据
  update(source?: { x0: any; y0: any; x?: any; y?: any } | undefined) {
    if (!source) {
      source = {
        x0: 0,
        y0: 0,
      }
      // 设置根节点所在的位置（原点）
      this.data.x0 = 0
      this.data.y0 = 0
    }

    const nodesOfDown = this.data.descendants().reverse()
    const linksOfDown = this.data.links()

    this.tree(this.data)

    const myTransition = this.svg?.transition().duration(500)

    /** *  绘制 root 子孙 ***/
    const { nodeEnter, node } = this.drawNode(nodesOfDown, source)
    // 增加展开按钮
    this.drawNodeBtn(nodeEnter, 'child')
    const { secretaryGroup } = this.drawAssistant(nodeEnter)
    this.drawAssistantLink(secretaryGroup)

    const { link, linkEnter } = this.drawLink(linksOfDown, source, 'child')

    // 有元素update更新和元素新增enter的时候
    this.nodeUpdating(node, nodeEnter, myTransition, source, link, linkEnter)

    this.data.eachBefore((d: { x0: any; x: any; y0: any; y: any }) => {
      d.x0 = d.x
      d.y0 = d.y
    })
  }

  private setExpandState(options: { type: any }) {
    this.data = d3.hierarchy(this.originTreeData, d => d.children)

    this.tree(this.data)

    ;[this.data.descendants()].forEach((nodes) => {
      nodes.forEach((node: { _children: any; children: null; depth: any }) => {
        node._children = node.children || null
        if (options.type === 'all') {
          // 如果是all的话，则表示全部都展开
          node.children = node._children
        }
        else if (options.type === 'fold') { // 如果是fold则表示除了父节点全都折叠
          // 将非根节点的节点都隐藏掉（其实对于这个组件来说加不加都一样）
          if (node.depth)
            node.children = null
        }
      })
    })
  }

  private onZoom(svg: d3.Selection<SVGSVGElement, undefined, null, undefined>, gAll: d3.Selection<SVGGElement, undefined, null, undefined>) {
    svg.call(
      d3.zoom()
        .scaleExtent([0.2, 5])
        .on('zoom', (e) => {
          gAll.attr('transform', () => {
            return `translate(${e.transform.x},${e.transform.y}) scale(${e.transform.k})`
          })
        }) as any,
    ).on('dblclick.zoom', null)
  }

  private initSvg() {
    return d3
      .create('svg')
      .attr('viewBox', () => {
        const parentsLength = this.originTreeData.parents ? this.originTreeData.parents.length : 0
        return [
          -this.config.width / 2,
          // 如果有父节点，则根节点居中，否则根节点上浮一段距离
          parentsLength > 0 ? -this.config.height / 2 : -this.config.height / 3,
          this.config.width,
          this.config.height,
        ]
      })
      .style('user-select', 'none')
      .style('cursor', 'move')
  }

  private clearSvg() {
    const oldSvg = d3.select('svg')
    // 如果宿主元素中包含svg标签了，那么则删除这个标签，再重新生成一个
    if (!oldSvg.empty())
      oldSvg.remove()
  }

  private createArrow(svg: d3.Selection<SVGSVGElement, undefined, null, undefined>): void {
    // 箭头(下半部分)
    svg
      .append('marker')
      .attr('id', 'markerOfDown')
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('viewBox', '0 -5 10 10') // 坐标系的区域
      .attr('refX', 55) // 箭头坐标
      .attr('refY', 0)
      .attr('markerWidth', 10) // 标识的大小
      .attr('markerHeight', 10)
      .attr('orient', '90') // 绘制方向，可设定为：auto（自动确认方向）和 角度值
      .attr('stroke-width', 2) // 箭头宽度
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5') // 箭头的路径
      .attr('fill', '#215af3') // 箭头颜色

    // 箭头(上半部分)
    svg
      .append('marker')
      .attr('id', 'markerOfUp')
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('viewBox', '0 -5 10 10') // 坐标系的区域
      .attr('refX', -50) // 箭头坐标
      .attr('refY', 0)
      .attr('markerWidth', 10) // 标识的大小
      .attr('markerHeight', 10)
      .attr('orient', '90') // 绘制方向，可设定为：auto（自动确认方向）和 角度值
      .attr('stroke-width', 2) // 箭头宽度
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5') // 箭头的路径
      .attr('fill', '#215af3') // 箭头颜色
  }

  private nodeUpdating(node: d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> | undefined, nodeEnter: d3.Selection<SVGGElement, unknown, SVGGElement, undefined> | undefined, myTransition: d3.Transition<SVGSVGElement, undefined, null, undefined> | undefined, source: { x0: any; y0: any; x?: any; y?: any } | undefined, link1: d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> | undefined, link1Enter: d3.Selection<SVGPathElement, unknown, SVGGElement, undefined> | undefined) {
    node
      ?.merge(nodeEnter as any)
      .transition(myTransition as any)
      .attr('transform', (d: any) => {
        return `translate(${d.x},${d.y})`
      })
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)

    // 有元素消失时
    node
      ?.exit()
      .transition(myTransition as any)
      .remove()
      .attr('transform', () => {
        return `translate(${source?.x0},${source?.y0})`
      })
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)

    link1?.merge(link1Enter as any).transition(myTransition as any).attr('d', this.computeRightAnglePath)

    link1
      ?.exit()
      .transition(myTransition as any)
      .remove()
      .attr('d', () => {
        const o = {
          source: {
            x: source?.x,
            y: source?.y,
          },
          target: {
            x: source?.x,
            y: source?.y,
          },
        }
        return this.computeRightAnglePath(o)
      })

    const expandButtonsSelection = d3.selectAll('g.expandBtn')

    expandButtonsSelection.select('text')
      .transition()
      .text((d: any) => {
        return d.children ? '-' : '+'
      })

    // TODO：如果按钮展开则这个按钮节点的下一个兄弟节点的秘书节点展开，否则不展开
    d3.selectAll('g.secretary-group')
      .transition(myTransition as any)
      .style('opacity', (d: any) => {
        return d.children ? 1 : 0
      })
  }

  private drawNode(data: any, source: { x0: any; y0: any; x?: any; y?: any } | undefined) {
    const node = this.gNodes?.selectAll('g.childrenNodeGroup')
      .data(data, (d: any) => {
        return d.data.id
      })

    const nodeEnter = node?.enter()
      .append('g')
      .attr('class', 'childrenNodeGroup')
      .attr('transform', () => {
        return `translate(${source?.x0},${source?.y0})`
      })
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .style('cursor', 'pointer')

    // 外层的矩形框
    nodeEnter
      ?.append('rect')
      .attr('width', (d: any) => {
        if (d.depth === 0)
          return (d.data.fullName.length + 2) * 16

        return this.config.rectWidth
      })
      .attr('height', (d: any) => {
        if (d.depth === 0)
          return 30

        return this.config.rectHeight
      })
      .attr('x', (d: any) => {
        if (d.depth === 0)
          return (-(d.data.fullName.length + 2) * 16) / 2

        return -this.config.rectWidth / 2
      })
      .attr('y', (d: any) => {
        if (d.depth === 0)
          return -15

        return -this.config.rectHeight / 2
      })
      .attr('rx', 5)
      .attr('stroke-width', 1)
      .attr('stroke', (d: any) => {
        if (d.depth === 0)
          return '#5682ec'

        return '#7A9EFF'
      })
      .attr('fill', (d: any) => {
        if (d.depth === 0)
          return '#7A9EFF'

        return '#FFFFFF'
      })
      .on('click', (e: Event, d: any) => {
        this.nodeClickEvent(e, d)
      })

    // 文本主标题
    nodeEnter?.append('text')
      .attr('class', 'main-title')
      .attr('x', () => {
        return 0
      })
      .attr('y', (d: any) => {
        if (d.depth === 0)
          return 5

        return -14
      })
      .attr('text-anchor', () => {
        return 'middle'
      })
      .text((d: any) => {
        if (d.depth === 0) {
          return d.data.fullName
        }
        else {
          return d.data.fullName.length > 11
            ? d.data.fullName.substring(0, 11)
            : d.data.fullName
        }
      })
      .attr('fill', (d: any) => {
        if (d.depth === 0)
          return '#FFFFFF'

        return '#000000'
      })
      .style('font-size', (d: any) => (d.depth === 0 ? 16 : 14))
      .style('font-family', '黑体')
      .style('font-weight', 'bold')
    // 副标题
    nodeEnter
      ?.append('text')
      .attr('class', 'sub-title')
      .attr('x', () => {
        return 0
      })
      .attr('y', () => {
        return 5
      })
      .attr('text-anchor', () => {
        return 'middle'
      })
      .text((d: any) => {
        if (d.depth !== 0) {
          const subTitle = d.data.fullName.substring(11)
          if (subTitle.length > 10)
            return `${subTitle.substring(0, 10)}...`

          return subTitle
        }
      })
      .style('font-size', () => 14)
      .style('font-family', '黑体')
      .style('font-weight', 'bold')

    return { nodeEnter, node }
  }

  private drawLink(data: any, source: { x0: any; y0: any; x?: any; y?: any } | undefined, role: 'parent' | 'child') {
    const className = role === 'parent' ? 'patentsLink' : 'childLink'
    const arrowDirection = role === 'parent' ? '#markerOfUp' : '#markerOfDown'

    const link = this.gLinks!.selectAll(`path.${className}`)
      .data(data, (d: any) => d.target.data.id)

    const linkEnter = link
      ?.enter()
      .append('path')
      .attr('class', className)
      .attr('d', () => {
        const o = {
          source: {
            x: source?.x0,
            y: source?.y0,
          },
          target: {
            x: source?.x0,
            y: source?.y0,
          },
        }
        return this.computeRightAnglePath(o)
      })
      .attr('fill', 'none')
      .attr('stroke', '#7A9EFF')
      .attr('stroke-width', 1)
      .attr('marker-end', `url(${arrowDirection})`)

    return { link, linkEnter }
  }

  drawAssistant(nodeEnter: d3.Selection<SVGGElement, unknown, SVGGElement, undefined> | undefined) {
    // 在秘书节点上添加特殊样式和矩形框
    const secretaryGroup = nodeEnter!.filter((d: any) => {
      return d.data.secretary
    }).append('g').attr('class', 'secretary-group').style('user-select', 'none').attr('cursor', 'auto')

    secretaryGroup.append('rect')
      .attr('class', 'secretary')
      .attr('transform', (d: any) => {
        if (d.depth !== 0) {
          const x = this.config.dx / 2 // 向右偏移100个单位，可以根据需要调整
          const y = (d.data.children?.length > 1) ? this.config.dy / 4 : this.config.dy / 2
          return `translate(${x},${y})`
        }

        // 如果秘书节点的深度为0（顶级），不需要向右移动
        return `translate(${this.config.dx / 2 - 52},${this.config.dy / 4 - 20})`
      })
      .attr('width', () => {
        return this.config.rectWidth
      })
      .attr('height', () => {
        return this.config.rectHeight
      })
      .attr('x', (d: any) => {
        if (d.depth === 0)
          return (-(d.data.secretary.name.length + 2) * 16) / 2

        return -this.config.rectWidth / 2
      })
      .attr('y', (d: any) => {
        if (d.depth === 0)
          return -15

        return -this.config.rectHeight / 2
      })
      .attr('rx', 5)
      .attr('stroke-width', 1)
      .attr('stroke', () => {
        return '#7A9EFF'
      })
      .attr('fill', () => {
        return '#FFFFFF'
      })

    secretaryGroup.append('text')
      .attr('class', 'secretary-name')
      .attr('x', () => {
        return this.config.dx / 2
      })
      .attr('y', (d: any) => {
        const isMultipleChildren = d.data.children?.length > 1
        const dy = this.config.dy

        if (d.depth === 0)
          return (isMultipleChildren ? dy / 2 : dy / 4)

        return isMultipleChildren ? dy / 4 - 10 : dy / 2 - 10
      })
      .attr('text-anchor', () => {
        return 'middle'
      })
      .text((d: any) => {
        if (d.depth === 0) {
          return d.data.secretary.name
        }
        else {
          return d.data.secretary.name.length > 11
            ? d.data.secretary.name.substring(0, 11)
            : d.data.secretary.name
        }
      })
      .attr('fill', () => {
        return '#000000'
      })
      .style('font-size', () => (14))
      .style('font-family', '黑体')
      .style('font-weight', 'bold')

    return { secretaryGroup }
  }

  drawAssistantLink(secretaryGroup: d3.Selection<SVGGElement, unknown, SVGGElement, undefined> | undefined) {
    secretaryGroup?.append('path')
      .attr('class', 'assistant-link')
      .attr('d', (d: any) => {
        const o = {
          source: {
            x: 0,
            y: this.config.dy / 2,
          },
          target: {
            x: (this.config.dx / 2) - this.config.rectWidth / 2,
            y: this.config.dy / 2,
          },
        }

        if (d.depth !== 0 && d.data.children?.length > 1) {
          o.source.y = this.config.dy / 2.5
          o.target.y = this.config.dy / 2.5
          return this.computeRightAnglePath(o)
        }

        if (d.depth === 0) {
          o.source.y = this.config.dy / 4
          o.target.y = this.config.dy / 4
          return this.computeRightAnglePath(o)
        }

        return this.computeRightAnglePath(o)
      })
      .attr('fill', 'none')
      .attr('stroke', '#7A9EFF')
      .attr('stroke-width', 1)
  }

  private drawNodeBtn(node: d3.Selection<SVGGElement, unknown, SVGGElement, undefined> | undefined, role: 'parent' | 'child') {
    const expandBtnG = node?.append('g')
      .attr('class', 'expandBtn')
      .attr('transform', () => {
        const y = (role === 'parent') ? -this.config.rectHeight / 2 : this.config.rectHeight / 2
        return `translate(${0},${y})`
      })
      .style('display', (d: any) => {
        // 如果是根节点，不显示
        if (d.depth === 0)
          return 'none'
        // 如果没有子节点，则不显示
        if (!d._children)
          return 'none'
        return 'block'
      })
      .on('click', (e: any, d: any) => {
        if (d.children) {
          d._children = d.children
          d.children = null
        }
        else {
          d.children = d._children
        }
        this.update(d)
      })

    expandBtnG
      ?.append('circle')
      .attr('r', 8)
      .attr('fill', '#7A9EFF')
      .attr('cy', () => role === 'parent' ? -8 : 8)

    expandBtnG
      ?.append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('y', () => role === 'parent' ? -3 : 13)
      .style('font-size', 16)
      .style('font-family', '微软雅黑')
      .text((d: any) => {
        return d.children ? '-' : '+'
      })
  }

  // 直角连接线
  computeRightAnglePath({ source, target }: any) {
    const halfDistance = (target.y - source.y) / 2
    const halfY = source.y + halfDistance
    return `M${source.x},${source.y} L${source.x},${halfY} ${target.x},${halfY} ${target.x},${target.y}`
  }

  // 展开所有的节点
  expandAllNodes() {
    this.drawChart({
      type: 'all',
    })
  }

  // 将所有节点都折叠
  foldAllNodes() {
    this.drawChart({
      type: 'fold',
    })
  }
}

export const mockData = {
  id: '96240625-934F-490B-8AA6-0BC775B18468',
  parentId: '-1',
  fullName: '正睿集团',
  secretary: {
    name: '秘书',
  },
  enCode: 'jinrui.com',
  enabledMark: 1,
  creatorTime: 1542620132000,
  description: null,
  hasChildren: true,
  children: [
    {
      id: '421308919646802693',
      parentId: '96240625-934F-490B-8AA6-0BC775B18468',
      fullName: '广州金睿智能科技有限公司',
      secretary: {
        name: '秘书',
      },
      enCode: null,
      enabledMark: 1,
      creatorTime: 1682584276000,
      description: '广州金睿智能科技有限公司',
      hasChildren: true,
      children: [
        {
          id: '421309056116871941',
          parentId: '421308919646802693',
          fullName: '数字研发部',
          enCode: null,
          enabledMark: 1,
          secretary: {
            name: '秘书',
          },
          creatorTime: 1682584309000,
          description: '<p>数字研发部</p>',
          hasChildren: true,
          children: [
            {
              id: '421309249956631301',
              parentId: '421309056116871941',
              fullName: '产品部',
              enCode: null,
              enabledMark: 1,
              creatorTime: 1682584355000,
              description: '产品部',
              hasChildren: false,
              children: [],
              sortCode: 0,
              manager: null,
              managerName: null,
              managerHeadIcon: null,
              managerMobilePhone: null,
              managerEntryDate: null,
              managerPositionManagementId: null,
              managerPositionManagementName: null,
              managerPositionRankClassId: null,
              managerPositionRankClassName: null,
              staffSize: 20,
              totalStaffSize: 20,
              activeStaff: 4,
              totalActiveStaf: 4,
              category: 'department',
              cooperativeList: [],
              hierarchy: 3,
              companyId: '96240625-934F-490B-8AA6-0BC775B18468',
            },
            {
              id: '421309163767878405',
              parentId: '421309056116871941',
              fullName: '技术部',
              enCode: null,
              enabledMark: 1,
              creatorTime: 1682584334000,
              description: '<p>技术部</p>',
              hasChildren: false,
              children: [],
              sortCode: 0,
              manager: '421311638319158021',
              managerName: '龙志强',
              managerHeadIcon: '/api/file/Image/userAvatar/20230512_426635526712353029.jpg',
              managerMobilePhone: '18379152911',
              managerEntryDate: null,
              managerPositionManagementId: '',
              managerPositionManagementName: null,
              managerPositionRankClassId: null,
              managerPositionRankClassName: null,
              staffSize: 80,
              totalStaffSize: 80,
              activeStaff: 9,
              totalActiveStaf: 9,
              category: 'department',
              cooperativeList: [],
              hierarchy: 3,
              companyId: '96240625-934F-490B-8AA6-0BC775B18468',
            },
          ],
          sortCode: 0,
          manager: '421310043376341765',
          managerName: '邱红建',
          managerHeadIcon: '/api/file/Image/userAvatar/001.png',
          managerMobilePhone: '13098889950',
          managerEntryDate: null,
          managerPositionManagementId: '',
          managerPositionManagementName: null,
          managerPositionRankClassId: null,
          managerPositionRankClassName: null,
          staffSize: 100,
          totalStaffSize: 200,
          activeStaff: 1,
          totalActiveStaf: 14,
          category: 'department',
          cooperativeList: [],
          hierarchy: 2,
          companyId: '96240625-934F-490B-8AA6-0BC775B18468',
        },
        {
          id: '421311147799499525',
          parentId: '421308919646802693',
          fullName: '销售部',
          enCode: null,
          enabledMark: 1,
          creatorTime: 1682584807000,
          description: '<p>销售部</p>',
          hasChildren: true,
          children: [
            {
              id: '421659920828487429',
              parentId: '421311147799499525',
              fullName: '销售二部',
              enCode: null,
              enabledMark: 1,
              creatorTime: 1682667961000,
              description: '<p>0</p>',
              hasChildren: false,
              children: [],
              sortCode: 0,
              manager: 'admin',
              managerName: '管理员',
              managerHeadIcon: '/api/file/Image/userAvatar/20230828_465806679263455173.jpeg',
              managerMobilePhone: '15626251595',
              managerEntryDate: null,
              managerPositionManagementId: '',
              managerPositionManagementName: null,
              managerPositionRankClassId: null,
              managerPositionRankClassName: null,
              staffSize: 10,
              totalStaffSize: 10,
              activeStaff: 0,
              totalActiveStaf: 0,
              category: 'department',
              cooperativeList: [],
              hierarchy: 3,
              companyId: '96240625-934F-490B-8AA6-0BC775B18468',
            },
            {
              id: '421659848002787077',
              parentId: '421311147799499525',
              fullName: '销售一部',
              enCode: null,
              enabledMark: 1,
              creatorTime: 1682667944000,
              description: '<p>销售一部</p>',
              hasChildren: false,
              children: [],
              sortCode: 10,
              manager: '421660150986725125',
              managerName: '张三',
              managerHeadIcon: '/api/file/Image/userAvatar/001.png',
              managerMobilePhone: '13800138001',
              managerEntryDate: null,
              managerPositionManagementId: '424479261190020421',
              managerPositionManagementName: '销售总监',
              managerPositionRankClassId: '421318822063002373',
              managerPositionRankClassName: 'M5',
              staffSize: 10,
              totalStaffSize: 10,
              activeStaff: 2,
              totalActiveStaf: 2,
              category: 'department',
              cooperativeList: [],
              hierarchy: 3,
              companyId: '96240625-934F-490B-8AA6-0BC775B18468',
            },
          ],
          sortCode: 1,
          manager: '421660150986725125',
          managerName: '张三',
          managerHeadIcon: '/api/file/Image/userAvatar/001.png',
          managerMobilePhone: '13800138001',
          managerEntryDate: null,
          managerPositionManagementId: '424479261190020421',
          managerPositionManagementName: '销售总监',
          managerPositionRankClassId: '421318822063002373',
          managerPositionRankClassName: 'M5',
          staffSize: 1000,
          totalStaffSize: 1020,
          activeStaff: 1,
          totalActiveStaf: 3,
          category: 'department',
          cooperativeList: [],
          hierarchy: 2,
          companyId: '96240625-934F-490B-8AA6-0BC775B18468',
        },
      ],
      sortCode: 0,
      manager: '421311275683828485',
      managerName: '李应海',
      managerHeadIcon: '/api/file/Image/userAvatar/001.png',
      managerMobilePhone: '18923090924',
      managerEntryDate: null,
      managerPositionManagementId: '',
      managerPositionManagementName: null,
      managerPositionRankClassId: null,
      managerPositionRankClassName: null,
      staffSize: 1000,
      totalStaffSize: 2230,
      activeStaff: 3,
      totalActiveStaf: 5,
      category: 'company',
      cooperativeList: [
        {
          id: '421321229404754693',
          parentId: '421308919646802693',
          fullName: '行政部',
          enCode: null,
          enabledMark: 1,
          creatorTime: 1682587211000,
          description: '行政部',
          hasChildren: false,
          children: [],
          sortCode: 3,
          manager: null,
          managerName: null,
          managerHeadIcon: null,
          managerMobilePhone: null,
          managerEntryDate: null,
          managerPositionManagementId: null,
          managerPositionManagementName: null,
          managerPositionRankClassId: null,
          managerPositionRankClassName: null,
          staffSize: 10,
          totalStaffSize: 10,
          activeStaff: 0,
          totalActiveStaf: 0,
          category: 'cooperative',
          cooperativeList: [],
          hierarchy: 2,
          companyId: '96240625-934F-490B-8AA6-0BC775B18468',
        },
      ],
      hierarchy: 1,
      companyId: '96240625-934F-490B-8AA6-0BC775B18468',
    },
  ],
  sortCode: 0,
  manager: '421311275683828485',
  managerName: '李应海',
  managerHeadIcon: '/api/file/Image/userAvatar/001.png',
  managerMobilePhone: '18923090924',
  managerEntryDate: null,
  managerPositionManagementId: '',
  managerPositionManagementName: null,
  managerPositionRankClassId: null,
  managerPositionRankClassName: null,
  staffSize: 1,
  totalStaffSize: 2231,
  activeStaff: 6,
  totalActiveStaf: 9,
  category: 'company',
  cooperativeList: [],
  hierarchy: 0,
  companyId: '-1',
}

export const mockData1 = {
  id: 'abc1005',
  // 根节点名称
  fullName: '山东吠舍科技有限责任公司',
  secretary: {
    name: '秘书',
  },
  // 子节点列表
  children: [
    {
      id: 'abc1006',
      fullName: '山东第一首陀罗科技服务有限公司',
      percent: '100%',
    },
    {
      id: 'abc1007',
      fullName: '山东第二首陀罗程技术有限公司',
      percent: '100%',
    },
    {
      id: 'abc1008',
      fullName: '山东第三首陀罗光伏材料有限公司',
      percent: '100%',
    },
    {
      id: 'abc1009',
      fullName: '山东第四首陀罗科技发展有限公司',
      percent: '100%',
      secretary: {
        name: '秘书',
      },
      children: [
        {
          id: 'abc1010',
          fullName: '山东第一达利特瑞利分析仪器有限公司',
          percent: '100%',
          secretary: {
            name: '秘书',
          },
          children: [
            {
              id: 'abc1011',
              fullName: '山东瑞利的子公司一',
              percent: '80%',
            },
            {
              id: 'abc1012',
              fullName: '山东瑞利的子公司二',
              percent: '90%',
            },
            {
              id: 'abc1013',
              fullName: '山东瑞利的子公司三',
              percent: '100%',
            },
          ],
        },
      ],
    },
    {
      id: 'abc1014',
      fullName: '山东第五首陀罗电工科技有限公司',
      percent: '100%',
      children: [
        {
          id: 'abc1015',
          fullName: '山东第二达利特低自动化设备有限公司',
          percent: '100%',
          children: [
            {
              id: 'abc1016',
              fullName: '山东敬业的子公司一',
              percent: '100%',
            },
            {
              id: 'abc1017',
              fullName: '山东敬业的子公司二',
              percent: '90%',
            },
          ],
        },
      ],
    },
    {
      id: 'abc1020',
      fullName: '山东第六首陀罗分析仪器(集团)有限责任公司',
      percent: '100%',
      children: [
        {
          id: 'abc1021',
          fullName: '山东第三达利特分气体工业有限公司',
        },
      ],
    },
  ],
}
