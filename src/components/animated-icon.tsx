let SplashScreen: any;
try {
  SplashScreen = require('expo-splash-screen');
} catch (e) {
  // Safe fallback if expo-splash-screen is missing
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

