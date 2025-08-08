// OhMyLive2d 配置 - 基于hexo配置
export const oml2dConfig = {
  enable: true,
  option: {
    dockedPosition: 'left', // 模型停靠位置 默认值: 'right' 可选值: 'left' | 'right'
    mobileDisplay: true, // 是否在移动端显示
    models: [
      {
        path: 'https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json',
        mobilePosition: [0, 23], // 移动端时模型在舞台中的位置
        mobileScale: 0.1, // 移动端时模型的缩放比例
        mobileStageStyle: {
          // 移动端时舞台的样式
          width: 180,
          height: 250,
        },
        motionPreloadStrategy: 'IDLE', // 动作预加载策略
        position: [0, 30], // 模型在舞台中的位置
        scale: 0.18, // 模型的缩放比例
        stageStyle: {
          width: 250,
          height: 250,
        },
      },
      {
        path: 'https://unpkg.com/cc-tia@1.0.0/model.json',
        scale: 0.3,
        position: [0, -120],
        mobileScale: 0.08,
        mobilePosition: [0, 0],
        mobileStageStyle: {
          width: 180,
        },
        stageStyle: {
          width: 320,
        },
      },
      {
        path: [
          'https://unpkg.com/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json',
          'https://unpkg.com/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json',
        ],
        scale: 0.12,
        position: [0, 0],
        stageStyle: {
          width: 250,
        },
        mobileScale: 0.08,
        mobilePosition: [0, 0],
        mobileStageStyle: {
          width: 180,
        },
      },
      {
        path: [
          'https://unpkg.com/cat-white@1.0.0/model.json',
          'https://unpkg.com/cat-black@1.0.0/model.json',
        ],
        scale: 0.12,
        position: [0, 10],
        mobileScale: 0.08,
        mobilePosition: [0, 0],
        mobileStageStyle: {
          width: 180,
        },
        stageStyle: {
          width: 250,
        },
      },
      {
        path: [
          'https://unpkg.com/hk416-1-normal@1.0.0/model.json',
          'https://unpkg.com/hk416-2-normal@1.0.0/model.json',
          'https://unpkg.com/hk416-2-destroy@1.0.0/model.json',
        ],
        scale: 0.09,
        position: [-30, 0],
        mobileScale: 0.08,
        mobilePosition: [0, 0],
        mobileStageStyle: {
          width: 180,
        },
        stageStyle: {
          width: 340,
        },
      },
      {
        path: 'https://unpkg.com/kar98k-normal@1.0.0/model.json',
        scale: 0.09,
        position: [0, 10],
        mobileScale: 0.08,
        mobilePosition: [0, 0],
        mobileStageStyle: {
          width: 180,
        },
        stageStyle: {
          width: 340,
        },
      },
      {
        path: 'https://unpkg.com/cc-histoire@1.0.0/model.json',
        scale: 0.3,
        position: [0, -130],
        mobileScale: 0.08,
        mobilePosition: [0, 0],
        mobileStageStyle: {
          width: 180,
        },
        stageStyle: {
          width: 320,
        },
      },
    ],
    parentElement: document.body, // 为组件提供一个父元素
    primaryColor: '#38B0DE', // 主题色
    sayHello: false, // 是否在初始化阶段打印项目信息
    tips: {
      style: {
        width: 230,
        height: 120,
        left: 'calc(50%)',
        top: '-100px',
      },
      mobileStyle: {
        width: 180,
        height: 80,
        left: 'calc(50% - 30px)',
        top: '-100px',
      },
      idleTips: {
        interval: 15000,
        // 自定义提示语
        message: ['你好呀~', '欢迎来到我的小站~', '今天也要加油哦！', '有什么想聊的吗？'],
      },
    },
  },
}

// 开发环境配置
export const devConfig = {
  ...oml2dConfig,
  option: {
    ...oml2dConfig.option,
    sayHello: true, // 开发环境显示调试信息
  },
}

// 生产环境配置
export const prodConfig = {
  ...oml2dConfig,
  option: {
    ...oml2dConfig.option,
    sayHello: false,
  },
}

// 根据环境导出配置
export default import.meta.env.DEV ? devConfig : prodConfig
