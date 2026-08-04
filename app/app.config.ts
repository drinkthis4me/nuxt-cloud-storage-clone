export default defineAppConfig({
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
