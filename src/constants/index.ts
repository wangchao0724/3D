import { cloneDeep, mergeWith, uniq } from "lodash-es";

export const CANVAS_ID = "canvas_id";

export const HZ = 60;

export const VIRTUAL_RENDER_MAP = {
  arrow: [
    "localization_global_history_trajectory",
    "perception_radar_front",
    "perception_obstacle_fusion",
    "perception_fusion /perception/fusion/object",
    "localization_local_history_trajectory",
    "perception_camera_front",
    "perception_camera_nv",
    // 旧接口
    "perception_fusion_object"
  ],
  target: [
    "perception_radar_front",
    "dpc_planning_debug_info",
    "perception_obstacle_fusion",
    "perception_fusion /perception/fusion/object",
    "perception_camera_front",
    "perception_camera_nv",
    // 旧接口
    "perception_fusion_object"
  ],
  crosswalk: ["localmap_crosswalk"],
  ellipse: ["localization_position"],
  freespace: [
    "localmap_lane_lane",
    // 旧接口
    "hdmap Free Space"
  ],
  fixedPolygon: [
    "perception_fusion perception_fusion_car_light",
    "perception_camera_nv perception_camera_car_light",
    "perception_camera_front perception_camera_car_light"
  ],
  polygon: [
    "perception_obstacle_fusion",
    "perception_fusion /perception/fusion/object",
    "perception_camera_front",
    "perception_camera_nv",
    // 旧接口
    "perception_fusion_object"
  ],
  polyline: [
    "dpc_lfp_planning_trajectory",
    "dpc_lfp_planning_planline",
    "dpc_planning_otherline",
    "dpc_planning_reference_line",
    "dpc_planning_edgeline",
    "dpc_planning_debug_info",
    "perception_camera_roadlines center_camera_fov30",
    "perception_camera_roadlines center_camera_fov120",
    "perception_camera_roadlines nv_cameras",
    "localmap_center_line",
    "localmap_lane_line",
    "localmap_stop_line",
    "localmap_speedbump",
    "memdrive_ref_route_trajectory",
    // 旧接口
    "hdmap Lane Lines"
  ],
  text_sprite: ["localmap_map_line_id", "localmap_map_lane_id"],
  car_pose: ["car_pose"]
} as const;

export const VIRTUAL_RENDER_TOPICS = Object.values(VIRTUAL_RENDER_MAP).flat();

export const AUGMENTED_RENDER_MAP = {
  crosswalk: ["pilothmi_cross_walk_local"],
  freespace: [
    "pilothmi_lane_line",
    // 旧接口
    "hdmap Free Space"
  ],
  obstacleModel: [
    "pilothmi_perception_obstacle_local",
    "pilothmi_perception_obstacle_fusion object"
  ],
  participantModel: ["pilothmi_perception_traffic_participant_fusion object"],
  polyline: [
    "pilothmi_lane_lines",
    "pilothmi_stop_line",
    "pilothmi_planning_lines_info",
    "pilothmi_pilot_planning_trajectory"
  ],
  trafficLightModel: ["localmap_other_traffic_light", "localmap_traffic_light"],
  trafficSignalModel: ["localmap_traffic_sign", "localmap_other_traffic_sign"],
  roadMarkerModel: ["localmap_road_marker"],
  poleModel: ["localmap_pole"]
} as const;

export const AUGMENTED_RENDER_TOPICS =
  Object.values(AUGMENTED_RENDER_MAP).flat();

export const OTHER_INFO_MAP = {
  topicInfo: ["/perception/fusion/object", "/perception/front_radar/object"],
  text: [
    "dpc_control_debug",
    "dpc_planning_tag",
    "odometry_info",
    "localmap_info"
  ],
  image: [
    "center_camera_fov120_marks",
    "center_camera_fov30_marks",
    "left_front_camera_marks",
    "left_rear_camera_marks",
    "rear_camera_marks",
    "right_front_camera_marks",
    "right_rear_camera_marks"
  ],
  TrafficLightGroup: ["localmap_traffic_light_group"],
  TrafficSignGroup: ["localmap_traffic_sign_group"],
  vehicle_info: ["sensor_vehicle_info"],
  vehicle_stat: ["sensor_vehicle_stat"],
  LaneSignGroup: ["localmap_lane_sign_group"],
  chart: [
    "sensor_can_frame_sequence_chart",
    "sensor_can_vehicle_map_chart",
    "sensor_imu_frame_sequence_chart",
    "sensor_imu_accel_chart",
    "sensor_can_wheel_speed_chart",
    "sensor_can_timestamp_chart",
    "sensor_imu_gyro_chart",
    "sensor_imu_timestamp_chart"
  ],
  monitorData: ["monitor_report"],
  data: ["visualizer_server_fps"],
  pilot_image_overlay: ["pilothmi_image_overlay"],
  pilotDrive: ["pilothmi_drive_info"],
  statusInfo: ["pilothmi_vehicle_report", "pilothmi_envm_info"],
  Weather: ["pilothmi_perception_envodd"],
  conn_list: ["conn_list"]
} as const;

export const OTHER_INFO_TOPICS = Object.values(OTHER_INFO_MAP).flat();

export const ALL_RENDER_MAP = mergeWith(
  cloneDeep(VIRTUAL_RENDER_MAP),
  AUGMENTED_RENDER_MAP,
  OTHER_INFO_MAP,
  (obj, src) => {
    if (!Array.isArray(src)) return;
    if (Array.isArray(obj)) {
      return uniq([...obj, ...src]);
    } else if (obj === undefined) {
      return src;
    }
  }
);

export const ALL_TOPICS = uniq([
  ...VIRTUAL_RENDER_TOPICS,
  ...AUGMENTED_RENDER_TOPICS,
  ...OTHER_INFO_TOPICS
]);
