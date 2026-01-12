/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
}

// Native Sonner toast API - simplified implementation
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      cancel: options?.cancel && {
        label: options.cancel.label,
        onClick: options.cancel.onClick || (() => {}),
      },
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      cancel: options?.cancel && {
        label: options.cancel.label,
        onClick: options.cancel.onClick || (() => {}),
      },
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      cancel: options?.cancel && {
        label: options.cancel.label,
        onClick: options.cancel.onClick || (() => {}),
      },
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      cancel: options?.cancel && {
        label: options.cancel.label,
        onClick: options.cancel.onClick || (() => {}),
      },
    });
  },

  // Default toast (same as basic toast)
  default: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      cancel: options?.cancel && {
        label: options.cancel.label,
        onClick: options.cancel.onClick || (() => {}),
      },
    });
  },

  // Loading toast for async operations
  loading: (message: string, options?: Omit<ToastOptions, 'duration'>) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel && {
        label: options.cancel.label,
        onClick: options.cancel.onClick || (() => {}),
      },
    });
  },

  // Promise toast for async operations with automatic state handling
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
      cancel: options?.cancel && {
        label: options.cancel.label,
        onClick: options.cancel.onClick || (() => {}),
      },
    });
  },

  // Dismiss specific toast
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    sonnerToast.dismiss();
  },
};

// Helper functions for common backend error handling
export const handleSupabaseError = (
  error: any,
  defaultMessage = 'Terjadi kesalahan'
) => {
  let message = defaultMessage;
  let description: string | undefined;

  if (error?.message) {
    // Handle specific Supabase errors
    if (error.message.includes('duplicate key')) {
      message = 'Data sudah ada';
      description = 'Data dengan informasi yang sama sudah tersimpan';
    } else if (error.message.includes('foreign key')) {
      message = 'Data terkait tidak ditemukan';
      description = 'Pastikan data yang direferensikan masih ada';
    } else if (
      error.message.includes('permission denied') ||
      error.message.includes('403')
    ) {
      message = 'Akses ditolak';
      description = 'Anda tidak memiliki izin untuk melakukan operasi ini';
    } else if (
      error.message.includes('network') ||
      error.message.includes('fetch')
    ) {
      message = 'Koneksi bermasalah';
      description = 'Periksa koneksi internet Anda';
    } else {
      message = 'Operasi gagal';
      description = error.message;
    }
  }

  toast.error(message, { description });
};

export const handleApiError = (
  error: any,
  defaultMessage = 'Terjadi kesalahan'
) => {
  let message = defaultMessage;
  let description: string | undefined;

  if (error?.response?.data?.message) {
    description = error.response.data.message;
  } else if (error?.message) {
    description = error.message;
  }

  // Handle specific HTTP status codes
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        message = 'Data tidak valid';
        break;
      case 401:
        message = 'Sesi berakhir';
        description = 'Silakan login kembali';
        break;
      case 403:
        message = 'Akses ditolak';
        description = 'Anda tidak memiliki izin untuk melakukan operasi ini';
        break;
      case 404:
        message = 'Data tidak ditemukan';
        break;
      case 500:
        message = 'Server bermasalah';
        description = 'Silakan coba lagi nanti';
        break;
    }
  }

  toast.error(message, { description });
};

// Success helpers
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, { description });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, { description });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, { description });
};