import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Text } from 'react-native';
import { colors } from '../theme/theme';

let SplashScreen: any;
try {
  SplashScreen = require('expo-splash-screen');
} catch (e) {
  // Safe fallback if expo-splash-screen is missing
}

interface AnimatedIconProps {
  size?: number;
  showText?: boolean;
}

export function AnimatedIcon({ size = 120, showText = false }: AnimatedIconProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 360-degree continuous rotation for theme blue circling ring
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Continuous pulse (bigger and smaller) for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.18,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.82,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, scaleValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ringSize = size * 1.35;
  const innerLogoSize = size * 0.75;
  const badgeFontSize = innerLogoSize * 0.42;

  return (
    <View style={[styles.outerWrapper, { width: ringSize, height: showText ? ringSize + 40 : ringSize }]}>
      <View style={[styles.container, { width: ringSize, height: ringSize }]}>
        {/* Theme Blue Circling Ring */}
        <Animated.View
          style={[
            styles.circlingRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              transform: [{ rotate: spin }],
            },
          ]}
        >
          {/* Glowing orbiting accent dot on the blue ring */}
          <View
            style={[
              styles.orbitDot,
              {
                top: 0,
                left: ringSize / 2 - (ringSize * 0.1) / 2,
                width: ringSize * 0.1,
                height: ringSize * 0.1,
                borderRadius: (ringSize * 0.1) / 2,
              },
            ]}
          />
        </Animated.View>

        {/* Soft Theme Blue Pulsing Halo */}
        <Animated.View
          style={[
            styles.glowBackground,
            {
              width: ringSize * 0.85,
              height: ringSize * 0.85,
              borderRadius: (ringSize * 0.85) / 2,
              transform: [{ scale: scaleValue }],
            },
          ]}
        />

        {/* Pulsing Central Logo (Bigger and Smaller) */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              width: innerLogoSize,
              height: innerLogoSize,
              borderRadius: innerLogoSize / 2,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <View style={styles.badgeWrap}>
            <Text style={[styles.badgeLetter, { fontSize: badgeFontSize }]}>S</Text>
          </View>
        </Animated.View>
      </View>

      {showText && <Text style={styles.brandTitle}>SOBOGGAN</Text>}
    </View>
  );
}

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (SplashScreen?.hideAsync) {
      SplashScreen.hideAsync().catch(() => {});
    }
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, 1200);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.splashOverlay, { opacity: fadeAnim }]}>
      <AnimatedIcon size={120} showText />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circlingRing: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#0274DF', // Primary Theme Blue
    borderRightColor: '#3C9FFE', // Light Theme Blue
    borderBottomColor: 'rgba(2, 116, 223, 0.15)', // Translucent Theme Blue Track
    borderLeftColor: '#0A84FF', // Vibrant Blue Accent
    shadowColor: '#0274DF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  orbitDot: {
    position: 'absolute',
    backgroundColor: '#3C9FFE',
    shadowColor: '#3C9FFE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 8,
    elevation: 6,
  },
  glowBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(2, 116, 223, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(60, 159, 254, 0.3)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy || '#0F1F3D',
    shadowColor: '#0274DF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2.5,
    borderColor: '#3C9FFE',
  },
  badgeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLetter: {
    color: colors.gold || '#C9A227',
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandTitle: {
    marginTop: 18,
    color: colors.navy || '#0F1F3D',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white || '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});

