import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// Solo importa estos módulos si no estás en modo dev
const { Platform, StatusBar } = !__DEV__ ? require('react-native') : {};
const { AdEventType, InterstitialAd, TestIds } = !__DEV__ ? require('react-native-google-mobile-ads') : {};

const InterstitialAdContext = createContext({
    showAd: () => { },
    isLoaded: false,
});

export const InterstitialAdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const adUnitId = __DEV__
        ? TestIds.INTERSTITIAL
        : Platform.OS === 'ios'
            ? 'ca-app-pub-1765209775909812/5795240781'  // ID real para iOS
            : 'ca-app-pub-1765209775909812/6581467594'; // ID real para Android

    const interstitialRef = useRef(
        !__DEV__
            ? InterstitialAd.createForAdRequest(adUnitId, {
                keywords: ['fashion', 'clothing'],
            })
            : null
    );

    useEffect(() => {
        if (__DEV__ || !interstitialRef.current) return;

        const interstitial = interstitialRef.current;

        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setIsLoaded(true);
        });

        const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
            if (Platform.OS === 'ios') StatusBar.setHidden(true);
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            if (Platform.OS === 'ios') StatusBar.setHidden(false);
            setIsLoaded(false);
            interstitial.load();
        });

        interstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeOpened();
            unsubscribeClosed();
        };
    }, []);

    const showAd = () => {
        if (!__DEV__ && isLoaded && interstitialRef.current) {
            interstitialRef.current.show();
        }
    };

    return (
        <InterstitialAdContext.Provider value={{ showAd, isLoaded: !__DEV__ && isLoaded }}>
            {children}
        </InterstitialAdContext.Provider>
    );
};

export const useInterstitialAd = () => useContext(InterstitialAdContext);
