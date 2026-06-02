export interface IChartMenuItem {
  direct: string;
  labelZh: string;
  labelEn: string;
  template: string;
  lang: 'mermaid' | 'plantuml';
}

const MERMAID_ITEMS: IChartMenuItem[] = [
  {
    direct: 'flow',
    labelZh: '流程图',
    labelEn: 'Flowchart',
    lang: 'mermaid',
    template: `flowchart TD
    A[开始] --> B{决策}
    B -->|选项 A| C[流程 A]
    B -->|选项 B| D[流程 B]
    C --> E[结束]
    D --> E`,
  },
  {
    direct: 'sequence',
    labelZh: '时序图',
    labelEn: 'Sequence',
    lang: 'mermaid',
    template: `sequenceDiagram
    actor 用户
    participant 前端
    participant 后端
    participant 数据库

    用户->>+前端: 登录请求
    前端->>+后端: 用户认证
    后端->>+数据库: 查询用户数据
    数据库-->>-后端: 返回用户信息
    后端-->>-前端: 认证结果
    前端-->>-用户: 登录响应

    Note over 前端,后端: 安全的 JWT 令牌交换
    Note over 后端,数据库: 加密通信`,
  },
  {
    direct: 'class',
    labelZh: '类图',
    labelEn: 'Class',
    lang: 'mermaid',
    template: `classDiagram
    class 动物 {
        +String 名称
        +移动()
        +进食()
    }
    class 狗 {
        +叫声()
    }
    动物 <|-- 狗`,
  },
  {
    direct: 'state',
    labelZh: '状态图',
    labelEn: 'State',
    lang: 'mermaid',
    template: `stateDiagram-v2
    [*] --> 等待中
    等待中 --> 处理中
    处理中 --> 已完成
    处理中 --> 失败
    失败 --> 等待中
    已完成 --> [*]`,
  },
  {
    direct: 'erDiagram',
    labelZh: 'ER图',
    labelEn: 'ER Diagram',
    lang: 'mermaid',
    template: `erDiagram
    User {
        string username "用户名"
        string email "邮箱"
        string userId "用户ID"
    }
    Order {
        int orderId "订单ID"
        date orderDate "订单日期"
        string address "收货地址"
    }
    Product {
        int productId "商品ID"
        string name "商品名称"
        string description "描述"
        float price "价格"
    }

    User }|--o{ Order : "下单"
    Order }|--o{ Product : "包含"`,
  },
  {
    direct: 'journey',
    labelZh: '用户旅程图',
    labelEn: 'Journey',
    lang: 'mermaid',
    template: `journey
    title 购物流程
    section 浏览
        打开首页: 5: 用户
        搜索商品: 3: 用户
        查看详情: 4: 用户
    section 结账
        加入购物车: 5: 用户
        结算: 3: 用户, 系统
        支付: 4: 用户, 系统`,
  },
  {
    direct: 'gantt',
    labelZh: '甘特图',
    labelEn: 'Gantt',
    lang: 'mermaid',
    template: `gantt
    title 甘特图示例
    dateFormat YYYY-MM-DD
    section 规划阶段
    项目启动    :a1, 2024-01-01, 7d
    设计阶段    :a2, after a1, 14d
    section 开发阶段
    实现开发    :a3, after a2, 30d
    测试    :a4, after a3, 14d
    section 部署阶段
    发布    :a5, after a4, 7d`,
  },
  {
    direct: 'pie',
    labelZh: '饼图',
    labelEn: 'Pie',
    lang: 'mermaid',
    template: `pie
    title 用户分布
    "中国" : 45
    "美国" : 25
    "欧洲" : 30`,
  },
  {
    direct: 'requirement',
    labelZh: '需求图',
    labelEn: 'Requirement',
    lang: 'mermaid',
    template: `requirementDiagram
    requirement "高可用性" {
        id: 1
        text: "系统必须保持高可用性"
        risk: high
        verifymethod: test
    }
    element "负载均衡器" {
        type: system
    }
    "负载均衡器" - SATISFIES -> "高可用性"`,
  },
  {
    direct: 'gitGraph',
    labelZh: 'Git图',
    labelEn: 'Git Graph',
    lang: 'mermaid',
    template: `gitGraph
    commit id: "初始化"
    branch develop
    checkout develop
    commit id: "功能-1"
    branch feature/login
    checkout feature/login
    commit id: "登录实现"
    commit id: "登录测试"
    checkout develop
    merge feature/login
    checkout main
    merge develop tag: "v1.0.0"
    branch hotfix
    checkout hotfix
    commit id: "修复bug"
    checkout main
    merge hotfix tag: "v1.0.1"`,
  },
  {
    direct: 'c4Context',
    labelZh: 'C4图',
    labelEn: 'C4 Context',
    lang: 'mermaid',
    template: `C4Context
    title 系统上下文
    Person(user, "用户", "系统用户")
    System(system, "核心系统", "处理业务逻辑")
    System_Ext(payment, "支付系统", "处理支付")
    Rel(user, system, "使用")
    Rel(system, payment, "调用")`,
  },
  {
    direct: 'mindmap',
    labelZh: '思维导图',
    labelEn: 'Mindmap',
    lang: 'mermaid',
    template: `mindmap
  root((思维导图))
    起源
      悠久历史
      普及
        英国心理学家托尼·博赞
    研究
      关于效果与特性
      关于自动创建
        用途
            创意技巧
            战略规划
            论证映射
    工具
      纸笔
      Mermaid`,
  },
  {
    direct: 'timeline',
    labelZh: '时间线图',
    labelEn: 'Timeline',
    lang: 'mermaid',
    template: `timeline
    title 社交媒体平台发展史
    2002 : 领英
    2004 : 脸书
         : 谷歌
    2005 : 油管
    2006 : 推特`,
  },
  {
    direct: 'sankey',
    labelZh: '桑基图',
    labelEn: 'Sankey',
    lang: 'mermaid',
    template: `sankey-beta

Salary,Budget,3000
Freelance,Budget,1200
Budget,Rent,1300
Budget,Food,600
Budget,Transport,250
Budget,Entertainment,350
Budget,Savings,700`,
  },
  {
    direct: 'xychart',
    labelZh: 'XY图表',
    labelEn: 'XY Chart',
    lang: 'mermaid',
    template: `xychart-beta
    title "销售收入"
    x-axis ["一月", "二月", "三月", "四月", "五月", "六月"]
    y-axis "收入（元）" 0 --> 11000
    bar [5000, 6000, 7500, 8200, 9500, 10500]
    line [5000, 6000, 7500, 8200, 9500, 10500]`,
  },
  {
    direct: 'block',
    labelZh: '块图',
    labelEn: 'Block',
    lang: 'mermaid',
    template: `block
columns 1
  db(("数据库"))
  blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)
  block:ID
    A
    B["中间宽块"]
    C
  end
  space
  D
  ID --> D
  C --> D
  style B fill:#969,stroke:#333,stroke-width:4px`,
  },
  {
    direct: 'packet',
    labelZh: '数据包图',
    labelEn: 'Packet',
    lang: 'mermaid',
    template: `---
title: "TCP 数据包"
---
packet
0-15: "源端口"
16-31: "目标端口"
32-63: "序列号"
64-95: "确认号"
96-99: "数据偏移"
100-105: "保留"
106: "URG"
107: "ACK"
108: "PSH"
109: "RST"
110: "SYN"
111: "FIN"
112-127: "窗口"
128-143: "校验和"
144-159: "紧急指针"
160-191: "(选项与填充)"
192-255: "数据（可变长度）"`,
  },
  {
    direct: 'kanban',
    labelZh: '看板图',
    labelEn: 'Kanban',
    lang: 'mermaid',
    template: `---
config:
  kanban:
    ticketBaseUrl: 'https://example.com/browse/#TICKET#'
---
kanban
  待办
    [创建文档]
    docs[创建新图表博客]
  [进行中]
    id6[创建通用渲染器]
  id9[待部署]
    id8[设计语法]@{ assigned: '张三' }
  id10[待测试]
    id4[创建解析测试]@{ ticket: MC-2038, assigned: '李四', priority: '高' }
  id11[已完成]
    id5[定义 getData]
    id2[修复标题超长问题]@{ ticket: MC-2036, priority: '非常高'}`,
  },
  {
    direct: 'architecture',
    labelZh: '架构图',
    labelEn: 'Architecture',
    lang: 'mermaid',
    template: `architecture-beta
    group api(cloud)[API Layer]

    service db(database)[Database] in api
    service disk1(disk)[Storage A] in api
    service disk2(disk)[Storage B] in api
    service server(server)[Server] in api

    db:L -- R:server
    disk1:T -- B:server
    disk2:T -- B:db`,
  },
  {
    direct: 'radar',
    labelZh: '雷达图',
    labelEn: 'Radar',
    lang: 'mermaid',
    template: `radar-beta
  title 餐厅对比
  axis food["食物质量"], service["服务"], price["价格"]
  axis ambiance["环境"]

  curve a["餐厅 A"]{4, 3, 2, 4}
  curve b["餐厅 B"]{3, 4, 3, 3}
  curve c["餐厅 C"]{2, 3, 4, 2}
  curve d["餐厅 D"]{2, 2, 4, 3}

  graticule polygon
  max 5`,
  },
  {
    direct: 'eventModeling',
    labelZh: '事件建模图',
    labelEn: 'Event Modeling',
    lang: 'mermaid',
    template: `eventmodeling

tf 01 ui CartUI
tf 02 cmd AddItem
tf 03 evt ItemAdded
tf 04 rmo CartView ->> 03
tf 05 ui CheckoutUI
tf 06 cmd SubmitOrder
tf 07 evt OrderCreated
tf 08 rmo OrderStatus ->> 07`,
  },
  {
    direct: 'treemap',
    labelZh: '树状图',
    labelEn: 'Treemap',
    lang: 'mermaid',
    template: `treemap-beta
"章节 1"
    "叶子 1.1": 12
    "章节 1.2"
      "叶子 1.2.1": 12
"章节 2"
    "叶子 2.1": 20
    "叶子 2.2": 25`,
  },
  {
    direct: 'venn',
    labelZh: '韦恩图',
    labelEn: 'Venn',
    lang: 'mermaid',
    template: `venn-beta
  title "Team Overlap"
  set FE[Frontend]
  set BE[Backend]
  union FE,BE["API"]`,
  },
  {
    direct: 'ishikawa',
    labelZh: '石川图',
    labelEn: 'Ishikawa',
    lang: 'mermaid',
    template: `ishikawa-beta
    照片模糊
    流程
        对焦不准
        快门过慢
        保护膜未撕
        美颜滤镜开启
    用户
        手抖
    设备
        镜头
            镜头不合适
            镜头损坏
            镜头脏污
        传感器
            传感器损坏
            传感器脏污
    环境
        主体移动过快
        光线过暗`,
  },
  {
    direct: 'wardley',
    labelZh: '沃德利地图',
    labelEn: 'Wardley',
    lang: 'mermaid',
    template: `wardley-beta
title Tea Shop Value Chain
size [1100, 600]

anchor User [0.95, 0.63]
component Tea [0.79, 0.61]
component TeaLeaf [0.63, 0.81]
component HotWater [0.52, 0.80]
component Kettle [0.43, 0.35]
component Power [0.10, 0.70]

User -> Tea
Tea -> TeaLeaf
Tea -> HotWater
HotWater -> Kettle
Kettle -> Power`,
  },
  {
    direct: 'cynefin',
    labelZh: 'Cynefin框架图',
    labelEn: 'Cynefin',
    lang: 'mermaid',
    template: `cynefin-beta
title Cynefin 框架

complex
"复杂项"
"另一复杂项"

complicated
"需要专家分析"

clear
"已知流程"

chaotic
"危机应对"

confusion
"未知领域项"

complex --> complicated : "识别模式"
clear --> chaotic : "自满"`,
  },
  {
    direct: 'treeView',
    labelZh: '树视图',
    labelEn: 'Tree View',
    lang: 'mermaid',
    template: `treeView-beta
  "my-project/"
    "src/"
      "index.js"
    "package.json"
    "README.md"`,
  },
  {
    direct: 'zenuml',
    labelZh: 'ZenUML时序图',
    labelEn: 'ZenUML Sequence',
    lang: 'mermaid',
    template: `zenuml
    title Demo
    Alice->Bob: Hello, how are you?
    Bob->Alice: Great!
    Alice->Bob: See you later!`,
  },
];

const PLANTUML_ITEMS: IChartMenuItem[] = [
  {
    direct: 'plantumlSequence',
    labelZh: '时序图',
    labelEn: 'Sequence',
    lang: 'plantuml',
    template: `@startuml
爱丽丝 -> 鲍勃: 认证请求
鲍勃 --> 爱丽丝: 认证响应
爱丽丝 -> 鲍勃: 再次认证请求
爱丽丝 <-- 鲍勃: 再次认证响应
@enduml`,
  },
  {
    direct: 'plantumlMindmap',
    labelZh: '思维导图',
    labelEn: 'Mindmap',
    lang: 'plantuml',
    template: `@startmindmap
* Debian
** Ubuntu
*** Linux Mint
*** Kubuntu
*** Lubuntu
*** KDE Neon
** LMDE
** SolydXK
** SteamOS
** Raspbian 长名称版
*** <s>Raspmbc</s> => OSMC
*** <s>Raspyfi</s> => Volumio
@endmindmap`,
  },
  {
    direct: 'plantumlGantt',
    labelZh: '甘特图',
    labelEn: 'Gantt',
    lang: 'plantuml',
    template: `@startgantt
[原型设计] requires 15 days
[测试原型] requires  10 days

[原型设计] starts D+0
[测试原型] starts D+15
@endgantt`,
  },
  {
    direct: 'plantumlArchimate',
    labelZh: '架构图',
    labelEn: 'Archimate',
    lang: 'plantuml',
    template: `@startuml
!define Junction_Or circle #black
!define Junction_And circle #whitesmoke

Junction_And JunctionAnd
Junction_Or JunctionOr

archimate #Technology "VPN 服务器" as vpnServerA <<technology-device>>

rectangle 继续 #lightgreen
rectangle 停止 #red
rectangle 等待 #orange
继续 -up-> JunctionOr
停止 -up-> JunctionOr
停止 -down-> JunctionAnd
等待 -down-> JunctionAnd
@enduml`,
  },
  {
    direct: 'plantumlNwdiag',
    labelZh: '网络图',
    labelEn: 'Network',
    lang: 'plantuml',
    template: `@startnwdiag
nwdiag {
  network 前端网络 {
    address = "192.168.10.0/24"
    color = "red"

    group web {
      web01 [address = ".1, .2", shape = "node"]
      web02 [address = ".2, .3"]
    }
  }
  network 后端网络 {
    address = "192.168.20.0/24"
    color = "palegreen"
    web01 [address = ".1"]
    web02 [address = ".2"]
    db01 [address = ".101", shape = database ]
    db02 [address = ".102"]

    group db {
      db01;
      db02;
    }
  }
}
@endnwdiag`,
  },
  {
    direct: 'plantumlClass',
    labelZh: '类图',
    labelEn: 'Class',
    lang: 'plantuml',
    template: `@startuml
abstract class 抽象列表
abstract 抽象集合
interface 列表
interface 集合
列表 <|-- 抽象列表
集合 <|-- 抽象集合
集合 <|- 列表
抽象集合 <|- 抽象列表
抽象列表 <|-- 数组列表
class 数组列表 {
  Object[] 元素数据
  size()
}
enum 时间单位 {
  天
  小时
  分钟
}
annotation 抑制警告
@enduml`,
  },
  {
    direct: 'plantumlUseCase',
    labelZh: '用例图',
    labelEn: 'Use Case',
    lang: 'plantuml',
    template: `@startuml
left to right direction
actor "美食评论家" as fc
rectangle 餐厅 {
  usecase "用餐" as UC1
  usecase "付款" as UC2
  usecase "饮品" as UC3
}
fc --> UC1
fc --> UC2
fc --> UC3
@enduml`,
  },
  {
    direct: 'plantumlActivity',
    labelZh: '活动图',
    labelEn: 'Activity',
    lang: 'plantuml',
    template: `@startuml
start
if (已安装 Graphviz?) then (是)
:处理所有图表;
else (否)
:仅处理时序图和活动图;
endif
stop
@enduml`,
  },
  {
    direct: 'plantumlComponent',
    labelZh: '组件图',
    labelEn: 'Component',
    lang: 'plantuml',
    template: `@startuml
数据访问 - [第一个组件]
[第一个组件] ..> HTTP : 使用
@enduml`,
  },
  {
    direct: 'plantumlState',
    labelZh: '状态图',
    labelEn: 'State',
    lang: 'plantuml',
    template: `@startuml
state fork_state <<fork>>
[*] --> fork_state
fork_state --> 状态2
fork_state --> 状态3
state join_state <<join>>
状态2 --> join_state
状态3 --> join_state
join_state --> 状态4
状态4 --> [*]
@enduml`,
  },
  {
    direct: 'plantumlObject',
    labelZh: '对象图',
    labelEn: 'Object',
    lang: 'plantuml',
    template: `@startuml
object 对象01
object 对象02
object 对象03
object 对象04
object 对象05
object 对象06
object 对象07
object 对象08
对象01 <|-- 对象02
对象03 *-- 对象04
对象05 o-- "4" 对象06
对象07 .. 对象08 : 标签
@enduml`,
  },
  {
    direct: 'plantumlDeployment',
    labelZh: '部署图',
    labelEn: 'Deployment',
    lang: 'plantuml',
    template: `@startuml
node 节点1
node 节点2
node 节点3
node 节点4
node 节点5
节点1 -- 节点2 : 标签1
节点1 .. 节点3 : 标签2
节点1 ~~ 节点4 : 标签3
节点1 == 节点5
@enduml`,
  },
  {
    direct: 'plantumlTiming',
    labelZh: '定时图',
    labelEn: 'Timing',
    lang: 'plantuml',
    template: `@startuml
concise "客户端" as Client
concise "服务端" as Server
concise "响应新鲜度" as Cache
Server is idle
Client is idle
@Client
0 is send
Client -> Server@+25 : GET
+25 is await
+75 is recv
+25 is idle
+25 is send
Client -> Server@+25 : GET If-Modified-Since: 150
+25 is await
+50 is recv
+25 is idle
@100 <-> @275 : 无需向服务端重复请求
@Server
25 is recv
+25 is work
+25 is send
Server -> Client@+25 : 200 OK Expires: 275
+25 is idle
+75 is recv
+25 is send
Server -> Client@+25 : 304 Not Modified
+25 is idle
@Cache
75 is fresh
+200 is stale
@enduml`,
  },
  {
    direct: 'plantumlRegex',
    labelZh: '正则图',
    labelEn: 'Regex',
    lang: 'plantuml',
    template: `@startregex
!option language de
!option useDescriptiveNames true

\\d?\\D+\\w*\\W{1,2}|\\s.\\S
@endregex`,
  },
  {
    direct: 'plantumlSalt',
    labelZh: '设计图',
    labelEn: 'Salt UI',
    lang: 'plantuml',
    template: `@startsalt
{^界面示例
  ==标题
  [默认按钮]
  [<b><color:green>绿色按钮]
  [ ---<color:#9a9a9a>禁用按钮-- ]
  []  <size:20><color:red>未勾选
  [X] <color:green>已勾选
  "//在此输入//   "
  ^下拉列表^
}}
@endsalt`,
  },
  {
    direct: 'plantumlWbs',
    labelZh: '工作分解图',
    labelEn: 'WBS',
    lang: 'plantuml',
    template: `@startwbs
* 业务流程建模 WBS
** 启动项目
*** 完成利益相关者调研
*** 初始实施计划
** 设计阶段
*** 完成现状流程模型
**** 现状流程模型 1
**** 现状流程模型 2
*** 衡量现状绩效指标
*** 识别速赢项
** 完成创新阶段
@endwbs`,
  },
  {
    direct: 'plantumlEbnf',
    labelZh: '语法图',
    labelEn: 'EBNF',
    lang: 'plantuml',
    template: `@startebnf
title PlantUML 支持的 EBNF 元素

(* 节点 *)
字面量 = "a";
特殊 = ? a ?;
规则 = a;

(* 边 *)
必选 = a;
可选 = [a];

零或多 = {a};
一或多 = a, {a};
一或多_ebnf = {a}-;

带分隔符零或多 = [a, {',', a}];
带分隔符一或多 = a, {',', a};
带终止符零或多 = {a, ','};
带终止符一或多 = a, ',', {a, ','};
带终止符一或多_ebnf = {a, ','}-;

备选 = a | b;
分组 = (a | b) , c;
无分组 = a | b , c;
@endebnf`,
  },
  {
    direct: 'plantumlJson',
    labelZh: 'JSON可视化',
    labelEn: 'JSON',
    lang: 'plantuml',
    template: `@startjson
{
   "水果":"苹果",
   "大小":"大",
   "颜色": ["红", "绿"]
}
@endjson`,
  },
  {
    direct: 'plantumlYaml',
    labelZh: 'YAML可视化',
    labelEn: 'YAML',
    lang: 'plantuml',
    template: `@startyaml
doe: "一只鹿，母鹿"
ray: "一缕金色阳光"
pi: 3.14159
xmas: true
french-hens: 3
calling-birds:
	- 休伊
	- 杜威
	- 路易
	- 弗雷德
xmas-fifth-day:
	calling-birds: 四
	french-hens: 3
	golden-rings: 5
	partridges:
		count: 1
		location: "梨树上"
	turtle-doves: 两只
@endyaml`,
  },
];

export const CHART_MENU_ITEMS: IChartMenuItem[] = [...MERMAID_ITEMS, ...PLANTUML_ITEMS];

const chartTemplateMap = new Map<string, IChartMenuItem>(
  CHART_MENU_ITEMS.map((item) => [item.direct, item]),
);

export const getMermaidMenuItems = (): IChartMenuItem[] => MERMAID_ITEMS;

export const getPlantumlMenuItems = (): IChartMenuItem[] => PLANTUML_ITEMS;

export const getChartTemplate = (direct: string): string | undefined =>
  chartTemplateMap.get(direct)?.template;

export const getChartFenceLang = (direct: string): 'mermaid' | 'plantuml' | undefined =>
  chartTemplateMap.get(direct)?.lang;
