import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { VIEW_WS } from "@/utils/websocket";

import { FixedPolygon, type FixedPolygonUpdateData } from "../common";

type FIXED_POLYGON_TOPIC_TYPE =
  (typeof VIRTUAL_RENDER_MAP.fixedPolygon)[number];

export default class FixedPolygonRender extends FixedPolygon {
  topic: FIXED_POLYGON_TOPIC_TYPE;
  constructor(scene: Scene, topic: FIXED_POLYGON_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: {
        data: FixedPolygonUpdateData;
        topic: FIXED_POLYGON_TOPIC_TYPE;
      }) => {
        this.update(data.data);
      }
    );
  }
}
