import type { Scene } from "three";

import type { VIRTUAL_RENDER_MAP } from "@/constants/topic";
import { TrafficSignal, type TrafficSignalUpdateData } from "@/renderer/public";
import { VIEW_WS } from "@/utils/websocket";

type TRAFFIC_SIGNAL_MODEL_TOPIC_TYPE =
  (typeof VIRTUAL_RENDER_MAP.trafficSignalModel)[number];

export default class TrafficSignalRender extends TrafficSignal {
  topic: TRAFFIC_SIGNAL_MODEL_TOPIC_TYPE;

  constructor(scene: Scene, topic: TRAFFIC_SIGNAL_MODEL_TOPIC_TYPE) {
    super(scene);
    this.topic = topic;

    VIEW_WS.on(
      topic,
      (data: {
        data: TrafficSignalUpdateData;
        topic: TRAFFIC_SIGNAL_MODEL_TOPIC_TYPE;
      }) => {
        this.update(data.data);
      }
    );
  }
}
