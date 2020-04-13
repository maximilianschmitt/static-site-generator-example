export const colors = {
    textDefault: '#000',
    textSecondary: 'rgba(0, 0, 0, 0.6)',
    textTertiary: 'rgba(0, 0, 0, 0.4)',
    textBlue: 'rgb(0, 86, 195)',
    textRed: 'rgb(255, 81, 81)',
    bgLight: '#efefef',
    bgLightYellow: '#fdf5db',
    bgLightBlue: 'rgb(237, 244, 252)',
    borderLightBlue: 'rgba(68, 94, 224, 0.2)',
    borderDefault: '#ccc',
    borderLight: '#f2f2f2'
}

export const fontFamilies = {
    default: "'Helvetica Neue', Helvetica, sans-serif, Arial",
    monospace: "Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace"
}

export const fontSizes = {
    s: '16px',
    default: '20px',
    l: '24px',
    xl: '36px',
    xxl: '44px',

    monospaceDefault: '16px'
}

export const borderRadi = {
    s: '2px',
    default: '4px'
}

export const lineHeights = {
    s: '1.2',
    default: '1.4',
    l: '1.6'
}

export const slimContainerWidth = '700px'
export const slimContainerPaddingX = '20px'

export const breakpoints = {
    xs: `only screen and (max-width: 350px)`,
    s: `only screen and (max-width: ${parseFloat(slimContainerWidth) +
        2 * parseFloat(slimContainerPaddingX)}px)`
}
