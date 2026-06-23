export interface LoadingState {
  loading: boolean;
  text?: string;
}

export interface LoadingContextValue {
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

export type LoadingVariant = "spinner" | "bar" | "skeleton";
export type LoadingSize = "sm" | "md" | "lg";
