Component({
  properties: {
    isShow: { // 控制弹窗是否显示的属性
      type: Boolean,
      value: false
    },
    titleSummary: String, // 优惠券价值 (e.g., "20元代金券")
    pointSummary: String, // 积分消耗 (e.g., "1,000积分")
    rulesList: Array // 规则列表
  },
  attached() {
    // ❗ 检查组件是否被成功加载
  },
  methods: {
    // 阻止点击穿透（点击内容不触发遮罩关闭）
    preventDeduce() {
      // do nothing
    },
    
    // 关闭弹窗（点击 X 或点击取消）
    closeModal() {
      this.setData({ isShow: false });
      // 触发外部事件，通知父组件弹窗已关闭
      this.triggerEvent('close'); 
    },

    // 点击遮罩层关闭弹窗
    tapMask() {
      this.closeModal();
    },
    
    // 点击取消按钮
    onCancel() {
      this.closeModal();
      this.triggerEvent('cancel');
    },

    // 点击确认按钮
    onConfirm() {
      this.closeModal();
      // 触发外部事件，通知父组件已确认兑换
      this.triggerEvent('confirm'); 
    }
  }
});