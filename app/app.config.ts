export default defineAppConfig({
  storage: {
    quotaBytes: 10 * 1024 * 1024 * 1024, // 10 GB
  },
  chunk: {
    sizeBytes: 8 * 1024 * 1024, // 8MB (S3 requires >= 5 MB)
    thresholdBytes: 32 * 1024 * 1024, // 32 MB (files above this use multipart upload)
  },
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'zinc',
    },
    input: {
      variants: {
        size: {
          '2xl': {
            base: 'px-4 py-3 text-xl gap-2',
            leading: 'ps-4',
            trailing: 'pe-4',
            leadingIcon: 'size-7',
            leadingAvatarSize: 'md',
            trailingIcon: 'size-7',
          },
        },
      },
      compoundVariants: [
        {
          leading: true,
          size: '2xl',
          class: 'ps-12',
        },
        {
          trailing: true,
          size: '2xl',
          class: 'pe-12',
        },
      ],
    },
  },
})
