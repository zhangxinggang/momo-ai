## 工具模块

onlineConfUrl 数据格式

```
{
  "update": {
    "version": "1.0.0",
    "description": "momo ai chat 1.0.0",
    "download": "http://wwww.baidu.com"
  },
  "tools": [
    {
      "title": "AI资讯",
      "childrenInLeaf": true,
      "icon": "bot",
      "children": [
        {
          "title": "模型排行",
          "icon": "listOrdered",
          "children": [
            {
              "title": "CocoLoop",
              "href": "https://top.cocoloop.cn/code"
            },
            {
              "title": "Artificial Analysis",
              "href": "https://artificialanalysis.ai/"
            },
            {
              "title": "Huggingface",
              "href": "https://huggingface.co/spaces/lmarena-ai/arena-leaderboard"
            },
            {
              "title": "LMArena",
              "href": "https://lmarena.ai/leaderboard"
            },
            {
              "title": "DataLearnerAI",
              "href": "https://www.datalearner.com/leaderboards"
            },
            {
              "title": "YesOneApi",
              "href": "https://goofuture.com/yes-one-api-product/models/ranking/"
            }
          ]
        }
      ]
    },
    {
      "title": "JSON解析",
      "icon": "fileCode",
      "children": [
        {
          "title": "site",
          "children": [
            {
              "title": "site",
              "href": "https://json.site/cn"
            }
          ]
        },
        {
          "title": "jsonpanda",
          "children": [
            {
              "title": "jsonpanda",
              "href": "https://jsonpanda.com/zh"
            }
          ]
        }
      ]
    },
    {
      "title": "图片",
      "icon": "bookImage",
      "children": [
        {
          "title": "在线icon",
          "children": [
            {
              "title": "lucide",
              "href": "https://lucide.dev/icons/"
            }
          ]
        },
        {
          "title": "图片转base64",
          "children": [
            {
              "title": "sojson",
              "href": "https://www.sojson.com/image2base64.html"
            },
            {
              "title": "ipbars",
              "href": "https://tools.ipbars.com/img2base64/"
            }
          ]
        },
        {
          "title": "图片压缩",
          "children": [
            {
              "title": "sojson",
              "href": "https://www.sojson.com/image/compress.html"
            },
            {
              "title": "webutils",
              "href": "https://www.webutils.app/image-compress"
            }
          ]
        },
        {
          "title": "svg转其他格式",
          "children": [
            {
              "title": "lddgo",
              "href": "https://www.lddgo.net/image/svg-format-converter"
            }
          ]
        },
        {
          "title": "格式转换",
          "children": [
            {
              "title": "sojson",
              "href": "https://www.sojson.com/image/format.html"
            }
          ]
        },
        {
          "title": "favicon制作",
          "children": [
            {
              "title": "sojson",
              "href": "https://www.sojson.com/image/favicon.html"
            },
            {
              "title": "ipbars",
              "href": "https://tools.ipbars.com/favicon/"
            }
          ]
        }
      ]
    },
    {
      "title": "编解码",
      "icon": "shieldCheck",
      "children": [
        {
          "title": "Base64加密、解密",
          "children": [
            {
              "title": "bejson",
              "href": "https://www.bejson.com/enc/base64/"
            }
          ]
        },
        {
          "title": "URL编码",
          "children": [
            {
              "title": "bejson",
              "href": "https://www.bejson.com/enc/urlencode/"
            }
          ]
        },
        {
          "title": "hash加密",
          "children": [
            {
              "title": "sojson",
              "href": "https://www.sojson.com/hash.html"
            }
          ]
        },
        {
          "title": "文件哈希计算工具",
          "children": [
            {
              "title": "bejson",
              "href": "https://www.bejson.com/encrypt/filehash/"
            }
          ]
        }
      ]
    },
    {
      "title": "网络",
      "icon": "globeLock",
      "children": [
        {
          "title": "浏览器信息",
          "children": [
            {
              "title": "ipbars",
              "href": "https://tools.ipbars.com/browserinfo/"
            }
          ]
        },
        {
          "title": "ContentType",
          "children": [
            {
              "title": "ipbars",
              "href": "https://tools.ipbars.com/contenttype/"
            }
          ]
        },
        {
          "title": "UserAgent",
          "children": [
            {
              "title": "ipbars",
              "href": "https://tools.ipbars.com/useragent/"
            }
          ]
        },
        {
          "title": "Http状态码",
          "children": [
            {
              "title": "ipbars",
              "href": "https://tools.ipbars.com/pagecode/"
            }
          ]
        },
        {
          "title": "Http头信息",
          "children": [
            {
              "title": "ipbars",
              "href": "https://tools.ipbars.com/httpheader/"
            }
          ]
        }
      ]
    }
  ],
  "skills": {
    "fileSource": [
      {
        "id": "claude-code",
        "name": "Claude Code 商店",
        "description": "来自 anthropics/skills 仓库的技能集合。",
        "type": "git-repo",
        "url": "https://github.com/anthropics/skills.git",
        "gitRef": "main"
      },
      {
        "id": "openai-codex",
        "name": "OpenAI Codex 商店",
        "description": "来自 openai/skills 仓库的技能集合。",
        "type": "git-repo",
        "url": "https://github.com/openai/skills.git",
        "gitRef": "main"
      },
      {
        "id": "vercel",
        "name": "Vercel 商店",
        "description": "来自 vercel-labs/agent-skills 仓库的技能集合。",
        "type": "git-repo",
        "url": "https://github.com/vercel-labs/agent-skills.git",
        "gitRef": "main"
      },
      {
        "id": "community",
        "name": "社区商店",
        "description": "来自 awesome-claude-skills 仓库的技能集合。",
        "type": "git-repo",
        "url": "https://github.com/ComposioHQ/awesome-claude-skills.git",
        "gitRef": "master"
      }
    ],
    "apiSource": [
      {
        "id": "skillhub",
        "name": "SkillHub 商店",
        "description": "来自 SkillHub 的精选技能集合。",
        "type": "skillhub",
        "url": "https://api.skillhub.cn/api/skills"
      },
      {
        "id": "clawhub",
        "name": "ClawHub 商店",
        "description": "来自 ClawHub 的公开技能集合。",
        "type": "clawhub",
        "url": "https://wry-manatee-359.convex.cloud/api/query"
      },
      {
        "id": "skills-sh",
        "name": "skills.sh 商店",
        "description": "内置 skills.sh 来源，浏览开放 Agent Skills 生态榜单。",
        "type": "skills-sh",
        "url": "https://skills.sh"
      }
    ]
  }
}
```
