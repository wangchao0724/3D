import {
  DoubleSide,
  GridHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3
} from "three";

import { ALL_TOPICS, VIRTUAL_RENDER_MAP } from "@/constants/topic";
import type { VIRTUAL_RENDER_TYPE } from "@/typings";
import log from "@/utils/log";
import { VIEW_WS } from "@/utils/websocket";

import type { EgoCarUpdateData } from "../common";
import type RenderObject from "../RenderObject";
import RenderScene from "../RenderScene";
import ArrowRender from "./ArrowRender";
import CrosswalkRender from "./CrosswalkRender";
import EgoCarRender from "./EgoCarRender";
import EllipseRender from "./EllipseRender";
import FixedPolygonRender from "./FixedPolygonRender";
import FreespaceRender from "./FreespaceRender";
import PoleRender from "./PoleRender";
import PolygonRender from "./PolygonRender";
import PolylineRender from "./PolylineRender";
import RoadMarkerRender from "./RoadMarkerRender";
import TargetRender from "./TargetRender";
import TextSpriteRender from "./TextSpriteRender";
import TrafficLightRender from "./TrafficLightRender";
import TrafficSignalRender from "./TrafficSignalRender";

export default class Virtual extends RenderScene {
  createRender: {
    [K in VIRTUAL_RENDER_TYPE]: RenderObject[];
  };

  ips: string[] = [];

  ground = new Group();

  constructor() {
    super();

    this.createRender = {
      arrow: VIRTUAL_RENDER_MAP.arrow.map(
        (topic) => new ArrowRender(this.scene, topic)
      ),
      car_pose: VIRTUAL_RENDER_MAP.car_pose.map(
        (topic) => new EgoCarRender(this.scene, topic)
      ),
      crosswalk: VIRTUAL_RENDER_MAP.crosswalk.map(
        (topic) => new CrosswalkRender(this.scene, topic)
      ),
      ellipse: VIRTUAL_RENDER_MAP.ellipse.map(
        (topic) => new EllipseRender(this.scene, topic)
      ),
      fixedPolygon: VIRTUAL_RENDER_MAP.fixedPolygon.map(
        (topic) => new FixedPolygonRender(this.scene, topic)
      ),
      freespace: VIRTUAL_RENDER_MAP.freespace.map(
        (topic) => new FreespaceRender(this.scene, topic)
      ),
      poleModel: VIRTUAL_RENDER_MAP.poleModel.map(
        (topic) => new PoleRender(this.scene, topic)
      ),
      polygon: VIRTUAL_RENDER_MAP.polygon.map(
        (topic) => new PolygonRender(this.scene, topic)
      ),
      polyline: VIRTUAL_RENDER_MAP.polyline.map(
        (topic) => new PolylineRender(this.scene, topic)
      ),
      roadMarkerModel: VIRTUAL_RENDER_MAP.roadMarkerModel.map(
        (topic) => new RoadMarkerRender(this.scene, topic)
      ),
      target: VIRTUAL_RENDER_MAP.target.map(
        (topic) => new TargetRender(this.scene, topic)
      ),
      text_sprite: VIRTUAL_RENDER_MAP.text_sprite.map(
        (topic) => new TextSpriteRender(this.scene, topic)
      ),
      trafficLightModel: VIRTUAL_RENDER_MAP.trafficLightModel.map(
        (topic) => new TrafficLightRender(this.scene, topic)
      ),
      trafficSignalModel: VIRTUAL_RENDER_MAP.trafficSignalModel.map(
        (topic) => new TrafficSignalRender(this.scene, topic)
      )
    };

    this.addEvents();

    this.preload();
  }

  addEvents() {
    this.on("enable", (data) => {
      const type = data.type as VIRTUAL_RENDER_TYPE;
      const topicMap = this.createRender[type];
      const render = topicMap.find((render) => render.topic === data.topic);
      if (!render) {
        log.danger(type, `[${data.topic}] not found`);
      } else {
        render.setEnable(data.enable);
      }
    });
    let updatedPos = false;

    const prePos = new Vector3();

    VIEW_WS.on(ALL_TOPICS.CAR_POSE, (data: { data: EgoCarUpdateData }) => {
      const [{ position, rotation }] = data.data.data;
      if (!updatedPos) {
        this.ground.position.copy(position);
        this.ground.rotation.z = rotation.z;
        updatedPos = true;
      }

      const deltaPos = new Vector3().copy(position).sub(prePos);

      this.camera.position.add(deltaPos);

      this.controls.target.add(deltaPos);

      prePos.copy(position);

      this.updateControls();
    });

    VIEW_WS.on(ALL_TOPICS.CONN_LIST, (data) => {
      this.ips = (data as any).conn_list || [];
    });
    window.addEventListener("keydown", this.onKeyDown);
  }

  preload() {
    EgoCarRender.preloading().then((res) => {
      res.forEach((item) => {
        if (item.status === "fulfilled") {
          this.scene.add(item.value);
        }
      });
    });
    const preloadArray = [
      RoadMarkerRender,
      PoleRender,
      TrafficLightRender,
      TrafficSignalRender
    ];
    return Promise.allSettled(
      preloadArray.map((modelRender) => modelRender.preloading())
    );
  }

  initialize(canvasId: string) {
    super.initialize(canvasId);
    this.updateControler();
    this.setScene();
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (!e.ctrlKey) return;
    if (e.code === "Space") {
      e.preventDefault();
      this.resetCamera();
    }
  };

  updateControler() {
    this.controls.target.set(3, 0, 6);
    this.updateControls();
  }

  setScene() {
    const size = 1000;
    const gridHelper = new GridHelper(size / 2, size / 20, 0x888888, 0x888888);
    gridHelper.rotation.x = Math.PI / 2;

    const geometry = new PlaneGeometry(size / 2, size / 2);
    const material = new MeshBasicMaterial({
      color: 0x232829,
      side: DoubleSide
    });
    const ground = new Mesh(geometry, material);
    ground.position.z = -0.3;
    this.ground.add(ground, gridHelper);
    this.scene.add(this.ground);
  }

  dispose(): void {
    Object.values(this.createRender).forEach((renders) => {
      renders.forEach((render) => {
        render.dispose();
      });
    });
    this.removeAllListeners();
    VIEW_WS.off(ALL_TOPICS.CAR_POSE);
    VIEW_WS.off(ALL_TOPICS.CONN_LIST);
    window.removeEventListener("keydown", this.onKeyDown);
    super.dispose();
  }
}
