const { Scene, Sprite, Label, Group } = require("spritejs/dist/spritejs");
const nzhcn = require("nzh/cn");

window.onload = function() {
  const scene = new Scene("#app", {
    viewport: ["auto", "auto"],
    resolution: [850, 850]
  });

  const layer = scene.layer();
  const currentDate = new Date();

  const time = {
    month: {
      length: 12,
      unit: "月",
      radius: 80,
      list: [],
      needRotateKey: "getMonth"
    },
    date: {
      length: new Date(new Date().setDate(0)).getDate(),
      radius: 140,
      unit: "日",
      list: [],
      group: {},
      needRotateKey: "getDate"
    },
    hour: {
      length: 24,
      radius: 210,
      unit: "点",
      list: [],
      needRotateKey: "getHours"
    },
    minute: {
      length: 60,
      radius: 280,
      unit: "分",
      list: [],
      needRotateKey: "getMinutes"
    },
    second: {
      length: 60,
      radius: 350,
      unit: "秒",
      list: [],
      needRotateKey: "getSeconds"
    }
  };

  Object.values(time).forEach(item => {
    item.list = Array.from(
      { length: item.length },
      (x, index) => `${nzhcn.encodeS(index + 1)}${item.unit}`
    );
  });

  // 构建表盘
  Object.entries(time).forEach(([key, item]) => {
    const rotate =
      (360 / item.length) *
      (new Date()[item.needRotateKey]() + -1 + (key === "month" ? 1 : 0));
    item.group = new Group().attr({
      size: [850, 850],
      anchor: [0.5, 0.5],
      pos: [425, 425],
      rotate: 90 - rotate
    });

    item.list
      .map(x => new Label(x))
      .map((label, index) => {
        const isCurrent =
          new Date()[item.needRotateKey]() + (key === "month" ? 1 : 0) ===
          index + 1;

        const degree = index * ((2 * Math.PI) / 360) * (360 / item.length);
        const x = 425 + Math.sin(degree) * item.radius;
        const y = 425 - Math.cos(degree) * item.radius;
        return label.attr({
          anchor: [0, 0.5],
          font: "14px Arial",
          fillColor: isCurrent ? "red" : "#fff",
          pos: [x, y],
          rotate: -90 + (360 / item.length) * index
        });
      })
      .forEach(x => item.group.append(x));

    layer.append(item.group);
  });

  /**
   * 旋转时钟
   * @param {*} item
   */
  async function rotateGroup(key, item) {
    const group = item.group;
    // 计算对应label
    const currentIndex =
      new Date()[item.needRotateKey]() + -1 + (key === "month" ? 1 : 0);
    // 计算对应角度
    const rotate = (90 - (360 / item.length) * currentIndex + 360) % 360;

    // 重置文字颜色
    group.children.forEach(x => {
      x.attr({
        fillColor: "#fff"
      });
    });

    await group.animate([{ rotate: rotate + 360 / item.length }, { rotate }], {
      duration: 500,
      fill: "forwards"
    }).finished;

    // await group.transition(0.5).attr({
    //   rotate
    // });

    // group.attr({
    //   rotate
    // });

    // 高亮当前文字颜色
    group.children[
      (currentIndex + group.children.length) % group.children.length
    ].attr({
      fillColor: "red"
    });
  }

  // 更新时钟
  setInterval(() => {
    const now = new Date();
    const last = new Date(Date.now() - 1000);
    Object.entries(time).forEach(([key, item]) => {
      if (key === "second") {
        rotateGroup(key, item);
      } else if (now[item.needRotateKey]() !== last[item.needRotateKey]()) {
        rotateGroup(key, item);
      }
    });
  }, 1000);
};
