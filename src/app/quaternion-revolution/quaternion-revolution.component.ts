import {
  Component,
  AfterViewInit,
  OnDestroy,
  viewChild,
  ElementRef,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-quaternion-revolution',
  standalone: true,
  imports: [],
  templateUrl: './quaternion-revolution.component.html',
  styleUrl: './quaternion-revolution.component.scss',
})
export class QuaternionRevolutionComponent implements AfterViewInit, OnDestroy {
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private animationId: number = 0;
  private frameCount = 0;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    // 建立場景
    this.scene = new THREE.Scene();

    // 建立相機
    this.camera = new THREE.PerspectiveCamera(
      75, // field of view
      window.innerWidth / window.innerHeight, // aspect ratio
      0.1, // near plane
      1000 // far plane
    );

    // 建立渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x222222);

    // 建立一個基本的立方體
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(1, 0, 0); // 初始位置
    this.scene.add(this.cube);

    // 設置相機位置
    this.camera.position.z = 5;

    // 監聽視窗大小變化
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private animate(): void {
    const peroid = 5000; // 旋轉周期，單位為毫秒
    const fps = 60; // frames per second
    const delta = 1000 / fps; // time per frame in milliseconds
    const fullRound = 2 * Math.PI;
    const rotationSpeed = fullRound / peroid; // radians per millisecond
    const rotationPerFrame = rotationSpeed * delta; // radians per frame
    const r = 3;

    this.cube.position.x = r * Math.cos(rotationPerFrame * this.frameCount);
    this.cube.position.z = r * Math.sin(rotationPerFrame * this.frameCount);
    // calculate quaternion using cross product for tangent direction
    const vectorOfPosition = this.cube.position.clone();
    const tangentDirection = vectorOfPosition
      .clone()
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize();

    // 立方體預設前方向是 -Z 軸
    const defaultForward = new THREE.Vector3(0, 0, -1);

    // 用 setFromUnitVectors 直接計算從預設方向到目標方向的四元數
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      defaultForward,
      tangentDirection
    );

    this.cube.quaternion.set(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    );

    this.frameCount++;
    this.animationId = requestAnimationFrame(() => this.animate());

    // 渲染場景
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
