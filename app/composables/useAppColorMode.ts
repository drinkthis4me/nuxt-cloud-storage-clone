export const useAppColorMode = () => {
  const colorMode = useColorMode()

  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set(_isDark) {
      colorMode.preference = _isDark ? 'dark' : 'light'
    },
  })

  const toggle = () => isDark.value = !isDark.value

  return {
    colorMode,
    isDark,
    toggle,
  }
}
