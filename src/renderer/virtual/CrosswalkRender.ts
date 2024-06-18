import type { Scene } from "three";

import { VIRTUAL_RENDER_MAP } from "@/constants";
import type { ALLRenderType } from "@/typings";
import { VIEW_WS } from "@/utils/websocket";

import { Crosswalk, type CrosswalkUpdateData } from "../public";
import Render from "../render";

const topics = VIRTUAL_RENDER_MAP.crosswalk;
type TopicType = (typeof topics)[number];

type CrosswalkUpdateDataMap = {
  [key in TopicType]: {
    topic: TopicType;
    data: CrosswalkUpdateData;
  };
};

type CreateRenderMap = {
  [key in TopicType]: Crosswalk;
};

export default class CrosswalkRender extends Render {
  type: ALLRenderType = "crosswalk";

  createRender = {} as CreateRenderMap;

  constructor(scene: Scene) {
    super();

    topics.forEach((topic) => {
      this.createRender[topic] = new Crosswalk(scene);
      VIEW_WS.on(topic, (data: CrosswalkUpdateDataMap[typeof topic]) => {
        this.createRender[data.topic].update(data.data);
      });
    });
  }

  dispose(): void {
    let topic: TopicType;
    for (topic in this.createRender) {
      VIEW_WS.off(topic);
    }
    super.dispose();
  }
}
