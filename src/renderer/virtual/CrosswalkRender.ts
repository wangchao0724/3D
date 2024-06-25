import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { Crosswalk, type CrosswalkUpdateData } from "../public";

type CROSSWALK_TOPIC_TYPE = (typeof VIRTUAL_RENDER_MAP.crosswalk)[number];

export default class CrosswalkRender extends Crosswalk {
  topic: CROSSWALK_TOPIC_TYPE;

  constructor(scene: Scene, topic: CROSSWALK_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: { data: CrosswalkUpdateData; topic: CROSSWALK_TOPIC_TYPE }) => {
        this.update(data.data);
      }
    );
  }
}
