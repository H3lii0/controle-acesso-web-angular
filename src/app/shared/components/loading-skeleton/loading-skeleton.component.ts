import { Component, Input } from '@angular/core';

export type LoadingSkeletonVariant = 'table' | 'cards' | 'detail' | 'chart' | 'form';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  templateUrl: './loading-skeleton.component.html',
  styleUrl: './loading-skeleton.component.scss',
})
export class LoadingSkeletonComponent {
  @Input() variant: LoadingSkeletonVariant = 'table';
  @Input() rows = 5;
}
