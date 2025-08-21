import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  viewChild,
} from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import * as THREE from 'three';

@Component({
  selector: 'app-tween-example',
  standalone: true,
  imports: [],
  templateUrl: './tween-example.component.html',
  styleUrl: './tween-example.component.scss',
})
export class TweenExampleComponent implements AfterViewInit, OnDestroy {
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
    // 使用不同的緩動效果
    this.move(new THREE.Vector3(2, 0, 0), 2000, this.easeInOutCubic.bind(this))
      .pipe(
        switchMap(() =>
          this.move(
            new THREE.Vector3(-2, 0, 0),
            2000,
            this.easeOutBounce.bind(this)
          )
        ),
        switchMap(() =>
          this.move(
            new THREE.Vector3(0, 2, 0),
            2000,
            this.easeInOutQuad.bind(this)
          )
        ),
        switchMap(() =>
          this.move(
            new THREE.Vector3(0, 0, -2),
            2000,
            this.easeOutElastic.bind(this)
          )
        ),
        switchMap(() =>
          this.move(
            new THREE.Vector3(2, 0, 0),
            2000,
            this.easeInOutCubic.bind(this)
          )
        )
      )
      .subscribe();
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

  // 緩動函數
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  private easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  private move(
    position: THREE.Vector3,
    duration: number,
    easingFunction: (t: number) => number = this.easeInOutCubic.bind(this)
  ): Observable<null> {
    const start = this.cube.position.clone();
    const end = position;
    const startTime = performance.now();
    let tweenAnimationId!: number;

    const observable = new Observable<null>((subscriber) => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const t = Math.min(elapsed / duration, 1); // Normalize t to [0, 1]
        const easedT = easingFunction(t); // 套用緩動函數
        this.cube.position.copy(start.clone().lerp(end, easedT));

        if (t < 1) {
          tweenAnimationId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(tweenAnimationId);
          subscriber.next(null);
          subscriber.complete();
        }
      };

      tweenAnimationId = requestAnimationFrame(animate);
    });

    return observable;
  }
}
