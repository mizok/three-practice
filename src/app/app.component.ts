import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CATALOGUE } from './catalogue';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly catalogue = CATALOGUE;

  // 狀態變數
  isTogglerActive = false;
  isMenuTopShaded = false;
  isMenuBotShaded = false;

  @ViewChild('menu') menu!: ElementRef<HTMLElement>;
  @ViewChildren('menuInner') menuInner!: QueryList<ElementRef<HTMLElement>>;

  ngOnInit() {
    // 移到 AfterViewInit
  }

  ngAfterViewInit() {
    this.initMenuScroll();
  }

  ngOnDestroy() {
    // 不再需要清理事件監聽器
  }

  // 切換器點擊事件
  protected onTogglerClick() {
    this.isTogglerActive = !this.isTogglerActive;
  }

  // 選單連結點擊事件
  protected onMenuLinkClick() {
    this.isTogglerActive = false;
  }

  // 選單滾動事件
  protected onMenuScroll(event: Event) {
    const target = event.target as HTMLElement;
    const menuElement = this.menu?.nativeElement;

    if (!target || !menuElement) return;

    const scrollTop = target.scrollTop;
    this.isMenuTopShaded = scrollTop > 0;
    this.isMenuBotShaded =
      target.scrollHeight - target.getBoundingClientRect().height - scrollTop >
      0;
  }

  // 視窗大小調整事件
  @HostListener('window:resize')
  onWindowResize() {
    this.updateMenuShadows();
  }

  private initMenuScroll() {
    this.updateMenuShadows();
  }

  private updateMenuShadows() {
    const inner = this.menuInner?.toArray();
    if (!inner?.length) return;

    inner.forEach((elementRef) => {
      const el = elementRef.nativeElement;
      const scrollTop = el.scrollTop;
      this.isMenuTopShaded = scrollTop > 0;
      this.isMenuBotShaded =
        el.scrollHeight - el.getBoundingClientRect().height - scrollTop > 0;
    });
  }
}
