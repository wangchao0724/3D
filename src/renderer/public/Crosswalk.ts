import {
  BufferAttribute,
  Color,
  DoubleSide,
  Mesh,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  type Vector3
} from "three";

import Target from "@/renderer/target";
import type { UpdateDataTool } from "@/typings";
import DepthContainer from "@/utils/three/depthTester";

interface CrosswalkData {
  color: { r: number; g: number; b: number };
  id: number;
  position: Vector3; // 中心点坐标，z轴坐标将忽略
  rotation: Vector3; // 朝向角，通常来说只识别z轴的偏向角
  shape: Vector3[];

  type?: number; // 元素类型
  lane_ids?: number[];
}

export interface UpdateData extends UpdateDataTool<CrosswalkData[]> {
  type: "crosswalk";
}

export default class Crosswalk extends Target {
  depth = DepthContainer.getDepth();

  update(data: UpdateData) {
    this.clear();
    const length = data.data.length;
    if (!length) return;
    data.data.forEach((item) => {
      const { id, shape, position, rotation, color } = item;
      const points = shape.map((point) => new Vector2(point.x, point.y));
      const side1 = new Vector2().subVectors(points[0], points[1]);
      const side2 = new Vector2().subVectors(points[1], points[2]);
      const aspect = side1.length() / side2.length();
      let pnts = [...points]; // 使用解构赋值创建 pnts 数组的副本
      if (aspect > 1) {
        pnts = [...pnts.slice(1), pnts[0]]; // 将 pnts 数组向右旋转一位
      }

      const shapeGeo = new ShapeGeometry(new Shape(pnts));
      // 动态计算条纹数量
      const stripes = aspect > 1 ? side1.length() : side2.length();

      const uvs = new Float32Array([0, 0, 1, 0, 1, stripes, 0, stripes]);
      shapeGeo.setAttribute("uv", new BufferAttribute(uvs, 2));
      const shapeMat = new ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
        
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform vec3 customColor; // 自定义颜色
        
          void main() {
            vec2 fUv = fract(vUv + vec2(0., 0.5)); // added vec2(0., 0.5)
            float strength = abs(fUv.y - 0.5);
            float blur = length(fwidth(vUv));
            strength = smoothstep(0.30 - blur, 0.30, strength);
            gl_FragColor = vec4(customColor, strength); // 使用自定义颜色和透明度
          }
        `,
        side: DoubleSide,
        transparent: true,
        uniforms: {
          customColor: { value: new Color(color.r, color.g, color.b) } // 设置默认自定义颜色
        }
      });
      const shapeMesh = new Mesh(shapeGeo, shapeMat);
      shapeMesh.position.set(position.x, position.y, this.depth);
      shapeMesh.rotation.set(rotation.x, rotation.y, rotation.z);
      shapeMesh.renderOrder = this.depth;
      shapeMesh.visible = this.enable;
      this.modelList.set(id, shapeMesh);
      this.scene.add(shapeMesh);
    });
  }
}
