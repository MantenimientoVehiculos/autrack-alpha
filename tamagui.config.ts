import { createTamagui, createTokens } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { themes } from './src/shared/theme/themes';

const interFont = createInterFont();

const fonts = {
    heading: interFont,
    body: interFont,
};

// Tokens basados en tus colores
const tokens = createTokens({
    color: {
        // Brown
        brownLight: '#F9F2ED',
        brownLightHover: '#F6EBE4',
        brownLightActive: '#EDD6C8',
        brownNormal: '#9D7E68',
        brownNormalHover: '#B27046',
        brownNormalActive: '#9E633E',
        brownDark: '#955D3B',
        brownDarkHover: '#774A2F',
        brownDarkActive: '#593823',

        // Grey
        greyLighter: '#A2A2A2',
        greyLightHover: '#909090',
        greyLightActive: '#797979',
        greyNormal: '#313131',
        greyNormalHover: '#2A2A2A',
        greyNormalActive: '#242424',
        greyDark: '#111111',
        greyDarkHover: '#0C0C0C',
        greyDarkActive: '#050505',

        // Surface
        white: '#FFFFFF',
        whiteHover: '#F9F9F9',
        whiteActive: '#EDEDED',
        surfaceLight: '#F9F9F9',
        surfaceLightHover: '#EDEDED',
        surfaceLightActive: '#E3E3E3',
        surfaceNormal: '#F4F4F4',
        surfaceNormalHover: '#E6E6E6',
        surfaceNormalActive: '#D8D8D8',
        surfaceDark: '#EEEEEE',
    },
    space: {
        $0: 0,
        $1: 4,
        $2: 8,
        $3: 16,
        $4: 24,
        $5: 32,
        $6: 40,
    },
    size: {
        $0: 0,
        $1: 4,
        $2: 8,
        $3: 16,
        $4: 24,
        $5: 32,
        $6: 40,
    },
    radius: {
        $0: 0,
        $1: 4,
        $2: 8,
        $3: 16,
        $4: 24,
        $5: 32,
    },
});

const config = createTamagui({
    defaultTheme: 'light',
    fonts,
    tokens,
    themes,
});

type AppConfig = typeof config;

declare module 'tamagui' {
    interface TamaguiCustomConfig extends AppConfig { }
}

export default config;