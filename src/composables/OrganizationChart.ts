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
  rootOfDown: any
  rootOfUp: any
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
      alert(d.name)
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
    this.rootOfDown = null
    this.rootOfUp = null

    this.drawChart({
      type: 'fold',
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

  private setExpandState(options: { type: any }) {
    this.rootOfDown = d3.hierarchy(this.originTreeData, d => d.children)
    this.rootOfUp = d3.hierarchy(this.originTreeData, d => d.parents)

    this.tree(this.rootOfDown)

    ;[this.rootOfDown.descendants(), this.rootOfUp.descendants()].forEach((nodes) => {
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

  // 更新数据
  update(source?: { x0: any; y0: any; x?: any; y?: any } | undefined) {
    if (!source) {
      source = {
        x0: 0,
        y0: 0,
      }
      // 设置根节点所在的位置（原点）
      this.rootOfDown.x0 = 0
      this.rootOfDown.y0 = 0
      this.rootOfUp.x0 = 0
      this.rootOfUp.y0 = 0
    }

    const nodesOfDown = this.rootOfDown.descendants().reverse()
    const linksOfDown = this.rootOfDown.links()
    const nodesOfUp = this.rootOfUp.descendants().reverse()
    const linksOfUp = this.rootOfUp.links()

    this.tree(this.rootOfDown)
    this.tree(this.rootOfUp)

    const myTransition = this.svg?.transition().duration(500)

    /** *  绘制 root 子孙 ***/
    const { node1Enter, node1 } = this.drawChildrenNode(nodesOfDown, source)

    // 增加展开按钮
    this.drawNodeBtn(node1Enter, 'child')

    const childLink = this.drawLink(linksOfDown, source, 'child')

    // 有元素update更新和元素新增enter的时候
    this.childrenNodeUpdating(node1, node1Enter, myTransition, source, childLink.link, childLink.linkEnter)

    /** *  绘制 root 祖先  ***/
    const { node2Enter, node2 } = this.drawParentsNode(nodesOfUp, source)

    // 增加展开按钮
    this.drawNodeBtn(node2Enter, 'parent')

    const parentLink = this.drawLink(linksOfUp, source, 'parent')

    // 有元素update更新和元素新增enter的时候
    this.parentsNodeUpdating(node2, node2Enter, myTransition, source, parentLink.link, parentLink.linkEnter)

    this.rootOfDown.eachBefore((d: { x0: any; x: any; y0: any; y: any }) => {
      d.x0 = d.x
      d.y0 = d.y
    })
    this.rootOfUp.eachBefore((d: { x0: any; x: any; y0: any; y: any }) => {
      d.x0 = d.x
      d.y0 = d.y
    })
  }

  private parentsNodeUpdating(node2: d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> | undefined, node2Enter: d3.Selection<SVGGElement, unknown, SVGGElement, undefined> | undefined, myTransition: d3.Transition<SVGSVGElement, undefined, null, undefined> | undefined, source: { x0: any; y0: any; x?: any; y?: any } | undefined, link2: d3.Selection<d3.BaseType, unknown, SVGGElement, undefined>, link2Enter: d3.Selection<SVGPathElement, unknown, SVGGElement, undefined>) {
    node2!
      .merge(node2Enter as any)
      .transition(myTransition as any)
      .attr('transform', (d: any) => {
        return `translate(${d.x},${d.y})`
      })
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)

    // 有元素消失时
    node2!
      .exit()
      .transition(myTransition as any)
      .remove()
      .attr('transform', () => {
        return `translate(${source?.x0},${source?.y0})`
      })
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)

    link2.merge(link2Enter as any).transition(myTransition as any).attr('d', this.computeRightAnglePath)

    link2
      .exit()
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

    // node数据改变的时候更改一下加减号
    const expandButtonsSelection = d3.selectAll('g.expandBtn')

    expandButtonsSelection.select('text').transition().text((d: any) => {
      return d.children ? '-' : '+'
    })
  }

  private drawParentsNode(nodesOfUp: any, source: { x0: any; y0: any; x?: any; y?: any } | undefined) {
    nodesOfUp.forEach((node: { y: number }) => {
      node.y = -node.y
    })

    const node2 = this.gNodes
      ?.selectAll('g.nodeOfUpItemGroup')
      .data(nodesOfUp, (d: any) => {
        return d.data.id
      })

    const node2Enter = node2
      ?.enter()
      .append('g')
      .attr('class', 'nodeOfUpItemGroup')
      .attr('transform', () => {
        return `translate(${source?.x0},${source?.y0})`
      })
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .style('cursor', 'pointer')

    // 外层的矩形框
    node2Enter!.append('rect')
      .attr('width', (d: any) => {
        if (d.depth === 0)
          return (d.data.name.length + 2) * 16

        return this.config.rectWidth
      })
      .attr('height', (d: any) => {
        if (d.depth === 0)
          return 30

        return this.config.rectHeight
      })
      .attr('x', (d: any) => {
        if (d.depth === 0)
          return (-(d.data.name.length + 2) * 16) / 2

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
    node2Enter!.append('text')
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
          return d.data.name
        }
        else {
          return d.data.name.length > 11
            ? d.data.name.substring(0, 11)
            : d.data.name
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
    node2Enter!.append('text')
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
          const subTitle = d.data.name.substring(11)
          if (subTitle.length > 10)
            return `${subTitle.substring(0, 10)}...`

          return subTitle
        }
      })
      .style('font-size', () => 14)
      .style('font-family', '黑体')
      .style('font-weight', 'bold')

    // 控股比例
    node2Enter!
      .append('text')
      .attr('class', 'percent')
      .attr('x', () => {
        return 12
      })
      .attr('y', () => {
        return 55
      })
      .text((d: any) => {
        if (d.depth !== 0)
          return d.data.percent
      })
      .attr('fill', '#000000')
      .style('font-family', '黑体')
      .style('font-size', () => 14)
    return { node2Enter, node2 }
  }

  private childrenNodeUpdating(node1: d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> | undefined, node1Enter: d3.Selection<SVGGElement, unknown, SVGGElement, undefined> | undefined, myTransition: d3.Transition<SVGSVGElement, undefined, null, undefined> | undefined, source: { x0: any; y0: any; x?: any; y?: any } | undefined, link1: d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> | undefined, link1Enter: d3.Selection<SVGPathElement, unknown, SVGGElement, undefined> | undefined) {
    node1
      ?.merge(node1Enter as any)
      .transition(myTransition as any)
      .attr('transform', (d: any) => {
        return `translate(${d.x},${d.y})`
      })
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)

    // 有元素消失时
    node1
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
  }

  private drawChildrenNode(nodesOfDown: any, source: { x0: any; y0: any; x?: any; y?: any } | undefined) {
    const node1 = this.gNodes?.selectAll('g.childrenNodeGroup')
      .data(nodesOfDown, (d: any) => {
        return d.data.id
      })

    const node1Enter = node1?.enter()
      .append('g')
      .attr('class', 'childrenNodeGroup')
      .attr('transform', () => {
        return `translate(${source?.x0},${source?.y0})`
      })
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .style('cursor', 'pointer')

    // 外层的矩形框
    node1Enter
      ?.append('rect')
      .attr('width', (d: any) => {
        if (d.depth === 0)
          return (d.data.name.length + 2) * 16

        return this.config.rectWidth
      })
      .attr('height', (d: any) => {
        if (d.depth === 0)
          return 30

        return this.config.rectHeight
      })
      .attr('x', (d: any) => {
        if (d.depth === 0)
          return (-(d.data.name.length + 2) * 16) / 2

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
    node1Enter?.append('text')
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
          return d.data.name
        }
        else {
          return d.data.name.length > 11
            ? d.data.name.substring(0, 11)
            : d.data.name
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
    node1Enter
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
          const subTitle = d.data.name.substring(11)
          if (subTitle.length > 10)
            return `${subTitle.substring(0, 10)}...`

          return subTitle
        }
      })
      .style('font-size', () => 14)
      .style('font-family', '黑体')
      .style('font-weight', 'bold')

    // 控股比例
    node1Enter
      ?.append('text')
      .attr('class', 'percent')
      .attr('x', () => {
        return 12
      })
      .attr('y', () => {
        return -45
      })
      .text((d: any) => {
        if (d.depth !== 0)
          return d.data.percent
      })
      .attr('fill', '#000000')
      .style('font-family', '黑体')
      .style('font-size', () => 14)

    return { node1Enter, node1 }
  }

  private drawLink(linksOfDown: any, source: { x0: any; y0: any; x?: any; y?: any } | undefined, role: 'parent' | 'child') {
    const className = role === 'parent' ? 'patentsLink' : 'childLink'
    const arrowDirection = role === 'parent' ? '#markerOfUp' : '#markerOfDown'

    const link = this.gLinks!.selectAll(`path.${className}`)
      .data(linksOfDown, (d: any) => d.target.data.id)

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
  id: 'abc1005',
  // 根节点名称
  name: '山东吠舍科技有限责任公司',
  // 子节点列表
  children: [
    {
      id: 'abc1006',
      name: '山东第一首陀罗科技服务有限公司',
      percent: '100%',
    },
    {
      id: 'abc1007',
      name: '山东第二首陀罗程技术有限公司',
      percent: '100%',
    },
    {
      id: 'abc1008',
      name: '山东第三首陀罗光伏材料有限公司',
      percent: '100%',
    },
    {
      id: 'abc1009',
      name: '山东第四首陀罗科技发展有限公司',
      percent: '100%',
      children: [
        {
          id: 'abc1010',
          name: '山东第一达利特瑞利分析仪器有限公司',
          percent: '100%',
          children: [
            {
              id: 'abc1011',
              name: '山东瑞利的子公司一',
              percent: '80%',
            },
            {
              id: 'abc1012',
              name: '山东瑞利的子公司二',
              percent: '90%',
            },
            {
              id: 'abc1013',
              name: '山东瑞利的子公司三',
              percent: '100%',
            },
          ],
        },
      ],
    },
    {
      id: 'abc1014',
      name: '山东第五首陀罗电工科技有限公司',
      percent: '100%',
      children: [
        {
          id: 'abc1015',
          name: '山东第二达利特低自动化设备有限公司',
          percent: '100%',
          children: [
            {
              id: 'abc1016',
              name: '山东敬业的子公司一',
              percent: '100%',
            },
            {
              id: 'abc1017',
              name: '山东敬业的子公司二',
              percent: '90%',
            },
          ],
        },
      ],
    },
    {
      id: 'abc1020',
      name: '山东第六首陀罗分析仪器(集团)有限责任公司',
      percent: '100%',
      children: [
        {
          id: 'abc1021',
          name: '山东第三达利特分气体工业有限公司',
        },
      ],
    },
  ],
  // 父节点列表
  parents: [
    {
      id: 'abc2001',
      name: '山东刹帝利集团有限责任公司',
      percent: '60%',
      parents: [
        {
          id: 'abc2000',
          name: '山东婆罗门集团有限公司',
          percent: '100%',
        },
      ],
    },
    {
      id: 'abc2002',
      name: '吴小远',
      percent: '40%',
    },
  ],
}
