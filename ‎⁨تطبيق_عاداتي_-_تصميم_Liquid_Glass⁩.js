import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Modal, TextInput, Animated, Alert,
  StyleSheet, useColorScheme, SafeAreaView, Platform, StatusBar, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient as SvgGrad, Stop, Path, Rect, Circle, Ellipse, G } from 'react-native-svg';
// الحزم الجديدة المسؤولة عن تأثير الزجاج السائل واللمعان
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const KEY = 'habits-rn-v1';
const INK = '#1d1b3a';
// ألوان باستيل زجاجية متوهجة لكل عادة
const COL = [
  ['rgba(255, 138, 122, 0.35)', 'rgba(255, 138, 122, 0.12)'],
  ['rgba(255, 213, 74, 0.35)', 'rgba(255, 213, 74, 0.12)'],
  ['rgba(95, 224, 183, 0.35)', 'rgba(95, 224, 183, 0.12)'],
  ['rgba(124, 196, 255, 0.35)', 'rgba(124, 196, 255, 0.12)'],
  ['rgba(183, 156, 255, 0.35)', 'rgba(183, 156, 255, 0.12)'],
  ['rgba(255, 156, 207, 0.35)', 'rgba(255, 156, 207, 0.12)'],
];
const SOLID_COL = ['#ff8a7a', '#ffd54a', '#5fe0b7', '#7cc4ff', '#b79cff', '#ff9ccf'];
const DN = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const GC = {
  B: ['#8fd3ff', '#1f6fe0'], R: ['#ff9a8a', '#d6282a'], G: ['#8ef0c0', '#0f9d6b'],
  P: ['#cdb8ff', '#6a3de0'], Y: ['#ffe985', '#f0a500'], K: ['#ffb3da', '#e0407f'],
  W: ['#ffffff', '#bfc6e6'],
};
const EMO = { '💧': 'drop', '🏃': 'run', '📖': 'book', '🧘': 'lotus', '🍎': 'apple', '😴': 'moon', '💊': 'pill', '⭐': 'star' };
const NAMES = ['drop', 'run', 'book', 'lotus', 'apple', 'moon', 'pill', 'star'];

const pad = (n) => (n < 10 ? '0' : '') + n;
const dk = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const back = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const uid = () => Math.random().toString(36).slice(2, 9);
const ok = (h, k) => (h.days[k] || 0) >= h.t;
const streak = (h) => {
  let n = 0;
  for (let i = 0; i < 400; i++) {
    if (ok(h, dk(back(i)))) n++;
    else if (i > 0) break;
  }
  return n;
};
const lvl = (tot) => Math.floor(Math.sqrt(tot / 10)) + 1;

/**
 * مكون الخلفية السائلة المتحركة (Ambient Liquid Background)
 * بدون خلفية ملونة خلف الزجاج، لن يظهر تأثير التغبيش والشفافية بوضوح.
 */
function LiquidBackground({ dark }) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim1, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(anim1, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(anim2, { toValue: 1, duration: 11000, useNativeDriver: true }),
        Animated.timing(anim2, { toValue: 0, duration: 11000, useNativeDriver: true }),
      ])
    ).start();
  }, [anim1, anim2]);

  const transY1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [-30, 60] });
  const transX1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [-20, 40] });
  const transY2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [40, -50] });
  const scale2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* قاعدة الخلفية */}
      <LinearGradient
        colors={dark ? ['#0d0c1d', '#191636', '#10182b'] : ['#e0dcfc', '#f3e7ff', '#d8f1ff']}
        style={StyleSheet.absoluteFill}
      />
      {/* فقاعة ضوئية علوية */}
      <Animated.View
        style={[
          st.orb,
          {
            top: -50,
            right: -60,
            width: 300,
            height: 300,
            backgroundColor: dark ? 'rgba(106, 61, 224, 0.45)' : 'rgba(183, 156, 255, 0.65)',
            transform: [{ translateY: transY1 }, { translateX: transX1 }],
          },
        ]}
      />
      {/* فقاعة ضوئية سفلية */}
      <Animated.View
        style={[
          st.orb,
          {
            bottom: 80,
            left: -70,
            width: 320,
            height: 320,
            backgroundColor: dark ? 'rgba(15, 157, 107, 0.35)' : 'rgba(95, 224, 183, 0.55)',
            transform: [{ translateY: transY2 }, { scale: scale2 }],
          },
        ]}
      />
      {/* فقاعة دافئة في المنتصف */}
      <View
        style={[
          st.orb,
          {
            top: height * 0.38,
            right: width * 0.2,
            width: 220,
            height: 220,
            backgroundColor: dark ? 'rgba(224, 64, 127, 0.28)' : 'rgba(255, 179, 218, 0.5)',
          },
        ]}
      />
    </View>
  );
}

/**
 * مكون حاوية الزجاج السائل القابلة لإعادة الاستخدام (LiquidGlassCard)
 * يدمج BlurView مع تدرج ضوئي وحافة زجاجية عاكسة
 */
function LiquidGlass({ children, style, dark, intensity = 45, tintColors, borderRadius = 28 }) {
  const defaultTint = dark
    ? ['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.04)']
    : ['rgba(255, 255, 255, 0.72)', 'rgba(255, 255, 255, 0.32)'];

  const borderColors = dark
    ? ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.2)']
    : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.75)'];

  return (
    <View style={[st.glassOuter, { borderRadius }, style]}>
      {/* طبقة التغبيش الحقيقية */}
      <BlurView
        intensity={Platform.OS === 'android' ? intensity + 25 : intensity}
        tint={dark ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      {/* طبقة انعكاس السائل اللوني */}
      <LinearGradient
        colors={tintColors || defaultTint}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      {/* إطار الحافة الزجاجية المضيئة */}
      <LinearGradient
        colors={borderColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[st.glassBorder, { borderRadius }]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

function Grads() {
  return (
    <Defs>
      {Object.keys(GC).map((k) => (
        <SvgGrad key={k} id={'g' + k} x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor={GC[k][0]} />
          <Stop offset="1" stopColor={GC[k][1]} />
        </SvgGrad>
      ))}
    </Defs>
  );
}

const ICONS = {
  drop: () => (<>
    <Path d="M24 4C24 4 9 21 9 31a15 15 0 0 0 30 0C39 21 24 4 24 4Z" fill="url(#gB)" />
    <Ellipse cx="17" cy="31" rx="3" ry="6.5" fill="#fff" opacity="0.55" transform="rotate(15 17 31)" />
  </>),
  run: () => (<>
    <Rect x="14" y="21" width="20" height="6" rx="3" fill="url(#gW)" />
    <Rect x="5" y="14" width="10" height="20" rx="4" fill="url(#gR)" />
    <Rect x="33" y="14" width="10" height="20" rx="4" fill="url(#gR)" />
    <Rect x="7" y="16" width="3" height="8" rx="1.5" fill="#fff" opacity="0.55" />
    <Rect x="35" y="16" width="3" height="8" rx="1.5" fill="#fff" opacity="0.55" />
  </>),
  book: () => (<>
    <Path d="M24 12C18 8 10 8 5 10v26c5-2 13-2 19 2Z" fill="url(#gP)" />
    <Path d="M24 12c6-4 14-4 19-2v26c-5-2-13-2-19 2Z" fill="url(#gW)" />
    <Path d="M24 12v26" stroke="#4a2bb0" strokeWidth="1.5" opacity="0.5" />
  </>),
  lotus: () => (<>
    <Ellipse cx="24" cy="26" rx="7" ry="15" fill="url(#gG)" transform="rotate(-55 24 36)" />
    <Ellipse cx="24" cy="26" rx="7" ry="15" fill="url(#gG)" transform="rotate(55 24 36)" />
    <Ellipse cx="24" cy="26" rx="7" ry="15" fill="url(#gG)" />
    <Ellipse cx="22" cy="20" rx="2" ry="6" fill="#fff" opacity="0.5" />
  </>),
  apple: () => (<>
    <Path d="M24 14c-4-4-18-2-18 14 0 9 7 16 12 16 3 0 4-1 6-1s3 1 6 1c5 0 12-7 12-16 0-16-14-18-18-14Z" fill="url(#gR)" />
    <Path d="M24 14c0-5 2-8 6-9" stroke="#6a3d1e" strokeWidth="3" strokeLinecap="round" fill="none" />
    <Ellipse cx="34" cy="9" rx="6" ry="3" fill="url(#gG)" transform="rotate(-25 34 9)" />
    <Ellipse cx="14" cy="26" rx="3" ry="6" fill="#fff" opacity="0.5" transform="rotate(20 14 26)" />
  </>),
  moon: () => (<>
    <Path d="M31 6a19 19 0 1 0 12 28A15 15 0 0 1 31 6Z" fill="url(#gY)" />
    <Circle cx="17" cy="24" r="2.5" fill="#f0a500" opacity="0.5" />
    <Circle cx="24" cy="34" r="2" fill="#f0a500" opacity="0.5" />
  </>),
  pill: () => (
    <G transform="rotate(-45 24 24)">
      <Rect x="4" y="14" width="40" height="20" rx="10" fill="url(#gK)" />
      <Path d="M24 14h10a10 10 0 0 1 0 20H24Z" fill="url(#gW)" />
      <Rect x="9" y="17" width="26" height="4" rx="2" fill="#fff" opacity="0.5" />
    </G>
  ),
  star: () => (<>
    <Path d="M24 4l6 13 14 2-10 10 3 14-13-7-13 7 3-14L4 19l14-2Z" fill="url(#gY)" stroke="#f0a500" strokeWidth="1" strokeLinejoin="round" />
    <Path d="M24 11l3 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </>),
};

function Icon({ name, size = 44 }) {
  const Body = ICONS[name] || ICONS.star;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Grads />
      <Ellipse cx="24" cy="45" rx="14" ry="2.5" fill="#000" opacity="0.16" />
      <Body />
    </Svg>
  );
}

function Pip({ level, happy }) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -5, duration: 1100, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 1100, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [bob]);
  const K = ['G', 'B', 'P', 'K', 'Y', 'R'][(level - 1) % 6];
  const g = `url(#g${K})`;
  const st = level < 2 ? 0 : level < 5 ? 1 : 2;
  const big = st === 2;
  const rx = big ? 34 : 27, ry = big ? 32 : 25, cy = big ? 58 : 64;
  const ey = big ? 58 : 62, ex = big ? 12 : 10, er = big ? 6 : 5.5, my = ey + 14;
  return (
    <Animated.View style={{ transform: [{ translateY: bob }] }}>
      <Svg width={92} height={92} viewBox="0 0 100 100">
        <Grads />
        <Ellipse cx="50" cy="94" rx="26" ry="4" fill="#000" opacity="0.2" />
        {st === 0 ? (<>
          <Ellipse cx="50" cy="58" rx="26" ry="33" fill="url(#gW)" />
          <Circle cx="40" cy="48" r="5" fill={g} />
          <Circle cx="58" cy="62" r="7" fill={g} />
          <Circle cx="44" cy="76" r="4" fill={g} />
          <Path d="M30 46l8 6 6-7 7 8 6-6 8 5" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
        </>) : (<>
          <Ellipse cx="50" cy={cy} rx={rx} ry={ry} fill={g} />
          <Ellipse cx={50 - rx * 0.3} cy={cy - ry * 0.45} rx={rx * 0.28} ry={ry * 0.18} fill="#fff" opacity="0.45" />
          {big && (<>
            <Path d="M50 27c-2-8 2-13 9-14" stroke="#0f9d6b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <Ellipse cx="62" cy="13" rx="7" ry="4" fill="url(#gG)" />
          </>)}
          <Circle cx={50 - rx * 0.62} cy={cy + ry * 0.3} r="4" fill="#ff7aa8" opacity="0.5" />
          <Circle cx={50 + rx * 0.62} cy={cy + ry * 0.3} r="4" fill="#ff7aa8" opacity="0.5" />
          <Circle cx={50 - ex} cy={ey} r={er} fill="#fff" />
          <Circle cx={50 + ex} cy={ey} r={er} fill="#fff" />
          <Circle cx={51 - ex} cy={ey + 1} r={er * 0.5} fill={INK} />
          <Circle cx={51 + ex} cy={ey + 1} r={er * 0.5} fill={INK} />
          {happy
            ? <Path d={`M40 ${my}q10 13 20 0Z`} fill={INK} />
            : <Path d={`M42 ${my + 2}q8 5 16 0`} stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />}
        </>)}
      </Svg>
    </Animated.View>
  );
}

function Card({ h, idx, th, dark, today, onTap, onLong }) {
  const c = h.days[today] || 0;
  const fin = c >= h.t;
  const s = streak(h);
  const colorIdx = (h.c || idx) % COL.length;
  const accentColor = SOLID_COL[colorIdx];

  return (
    <Pressable onLongPress={() => onLong(h)} style={{ marginBottom: 18 }}>
      <LiquidGlass dark={dark} intensity={50} tintColors={COL[colorIdx]} style={st.cardInner}>
        <View style={st.row}>
          {/* حاوية الأيقونة الزجاجية المصغرة */}
          <View style={[st.emo, { backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.65)' }]}>
            <Icon name={h.e} size={42} />
          </View>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={[st.nm, { color: th.ink }]}>{h.name}</Text>
            <Text style={[st.meta, { color: th.ink }]}>
              {s ? `${s} يوم ورا بعض 🔥` : h.t > 1 ? `النهارده ${c} من ${h.t}` : 'ابدأ النهارده'}
            </Text>
          </View>
          {/* زر الإنجاز الزجاجي */}
          <Pressable
            onPress={() => onTap(h)}
            style={({ pressed }) => [
              st.big,
              {
                backgroundColor: fin
                  ? accentColor
                  : dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.85)',
                borderColor: 'rgba(255,255,255,0.6)',
              },
              pressed && st.bigDown,
            ]}
          >
            <Text style={[st.bigTxt, { color: fin ? INK : th.ink }]}>
              {fin ? '✓' : h.t > 1 ? `${c}/${h.t}` : '+'}
            </Text>
          </Pressable>
        </View>

        {/* شريط التقدم السائل */}
        <View style={[st.track, { backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(29,27,58,0.1)' }]}>
          <View style={[st.fill, { width: `${Math.min(c / h.t, 1) * 100}%`, backgroundColor: accentColor }]} />
        </View>

        {/* أيام الأسبوع الزجاجية */}
        <View style={st.row}>
          {[6, 5, 4, 3, 2, 1, 0].map((i) => {
            const d = back(i), k = dk(d), n = h.days[k] || 0;
            const isDone = n >= h.t;
            const isPartial = n > 0 && n < h.t;
            return (
              <View
                key={i}
                style={[
                  st.wd,
                  {
                    backgroundColor: isDone
                      ? accentColor
                      : isPartial
                        ? 'rgba(255,255,255,0.6)'
                        : dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)',
                  },
                  i === 0 && { borderWidth: 1.5, borderColor: th.ink },
                ]}
              >
                <Text style={[st.wdTxt, { color: isDone ? INK : th.ink }]}>{isDone ? '✓' : DN[d.getDay()]}</Text>
              </View>
            );
          })}
        </View>
      </LiquidGlass>
    </Pressable>
  );
}

export default function App() {
  const dark = useColorScheme() === 'dark';
  const th = dark
    ? { bg: '#0d0c1d', ink: '#f4f3ff', mute: '#b4b0dc', field: 'rgba(255,255,255,0.1)' }
    : { bg: '#eceaff', ink: INK, mute: '#5a5682', field: 'rgba(255,255,255,0.65)' };

  const [habits, setHabits] = useState([]);
  const [ready, setReady] = useState(false);
  const [add, setAdd] = useState(false);
  const [imp, setImp] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('drop');
  const [cnt, setCnt] = useState(1);
  const [txt, setTxt] = useState('');
  const today = dk(back(0));

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((r) => { if (r) setHabits(JSON.parse(r)); }).catch(() => {}).finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(habits)).catch(() => {});
  }, [habits, ready]);

  const tap = (h) => {
    const c = h.days[today] || 0;
    const days = { ...h.days };
    if (c >= h.t) {
      delete days[today];
      Haptics.selectionAsync();
    } else {
      days[today] = c + 1;
      if (c + 1 >= h.t) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setHabits((hs) => hs.map((x) => (x.id === h.id ? { ...x, days } : x)));
  };

  const longPress = (h) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('حذف عادة', `تحذف "${h.name}"؟`, [
      { text: 'لأ', style: 'cancel' },
      { text: 'أيوه', style: 'destructive', onPress: () => setHabits((hs) => hs.filter((x) => x.id !== h.id)) },
    ]);
  };

  const save = () => {
    const n = name.trim();
    if (!n) return;
    setHabits((hs) => [...hs, { id: uid(), name: n.slice(0, 30), e: icon, c: hs.length % COL.length, t: cnt, days: {} }]);
    setName(''); setCnt(1); setAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const doImport = () => {
    try {
      const o = JSON.parse(txt.trim());
      const list = Array.isArray(o) ? o : o.habits;
      if (!Array.isArray(list)) throw new Error('bad');
      let skipped = 0;
      const mapped = [];
      list.forEach((h) => {
        if (h.k) { skipped++; return; }
        mapped.push({
          id: h.id || uid(), name: String(h.name || '').slice(0, 30) || 'عادة',
          e: NAMES.includes(h.e) ? h.e : (EMO[h.e] || 'star'),
          c: h.c || 0, t: Math.max(1, parseInt(h.t, 10) || 1), days: h.days || {},
        });
      });
      setHabits((hs) => [...hs, ...mapped]);
      setImp(false); setTxt('');
      Alert.alert('تم الاستيراد', `اتضافت ${mapped.length} عادة${skipped ? `، وتخطّيت ${skipped} من الأنواع الخاصة` : ''}.`);
    } catch (e) {
      Alert.alert('خطأ', 'النص ده مش نسخة احتياطية صحيحة.');
    }
  };

  let act = 0, done = 0, tot = 0;
  habits.forEach((h) => {
    act++; if (ok(h, today)) done++;
    Object.keys(h.days).forEach((k) => { tot += h.days[k]; });
  });
  const L = lvl(tot), cu = 10 * (L - 1) * (L - 1), nx = 10 * L * L;

  return (
    <View style={st.flex}>
      {/* الخلفية السائلة المتحركة */}
      <LiquidBackground dark={dark} />

      <SafeAreaView style={[st.flex, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
          <Text style={[st.h1, { color: th.ink }]}>عاداتي</Text>

          {/* بطاقة البطل بتصميم Liquid Glass */}
          <LiquidGlass
            dark={dark}
            intensity={60}
            tintColors={dark ? ['rgba(124, 100, 255, 0.25)', 'rgba(40, 35, 90, 0.45)'] : ['rgba(255, 255, 255, 0.8)', 'rgba(235, 230, 255, 0.45)']}
            style={st.heroInner}
          >
            <View style={st.row}>
              <Pip level={L} happy={act > 0 && done === act} />
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={[st.heroTxt, { color: th.ink }]}>
                  {!act ? 'ابدأ بأول عادة' : done === act ? 'خلّصت كل حاجة النهارده! 🎉' : `خلّصت ${done} من ${act} النهارده`}
                </Text>
                <View style={st.bar}>
                  <View style={[st.barFill, { width: `${act ? (done / act) * 100 : 0}%`, backgroundColor: '#ffd54a' }]} />
                </View>
                <Text style={[st.lvTxt, { color: th.ink }]}>مستوى {L} · {tot * 10} نقطة</Text>
                <View style={st.bar}>
                  <View style={[st.barFill, { width: `${((tot - cu) / (nx - cu)) * 100}%`, backgroundColor: '#5fe0b7' }]} />
                </View>
              </View>
            </View>
          </LiquidGlass>

          {habits.map((h, i) => (
            <Card key={h.id} h={h} idx={i} th={th} dark={dark} today={today} onTap={tap} onLong={longPress} />
          ))}

          {!habits.length && (
            <LiquidGlass dark={dark} intensity={35} style={{ padding: 24, marginTop: 10 }}>
              <Text style={[st.empty, { color: th.mute }]}>مفيش عادات لسه. دوس على الزرار تحت عشان تبدأ.</Text>
            </LiquidGlass>
          )}

          <Pressable onPress={() => setImp(true)} style={st.link}>
            <Text style={{ color: th.mute, fontWeight: '700' }}>استيراد من نسخة الويب</Text>
          </Pressable>
          <Text style={[st.dev, { color: th.mute }]}>تطوير: محمد سامح</Text>
        </ScrollView>

        {/* الزرار العائم بتأثير الزجاج السائل المضيء */}
        <Pressable
          onPress={() => { Haptics.selectionAsync(); setAdd(true); }}
          style={({ pressed }) => [st.fabWrap, pressed && st.fabDown]}
        >
          <LiquidGlass
            dark={dark}
            intensity={75}
            borderRadius={32}
            tintColors={['rgba(255, 213, 74, 0.85)', 'rgba(255, 180, 40, 0.65)']}
            style={st.fabGlass}
          >
            <Text style={st.fabTxt}>＋ عادة جديدة</Text>
          </LiquidGlass>
        </Pressable>

        {/* نافذة إضافة عادة زجاجية */}
        <Modal visible={add} transparent animationType="slide" onRequestClose={() => setAdd(false)}>
          <View style={st.back}>
            <LiquidGlass
              dark={dark}
              intensity={85}
              tintColors={dark ? ['rgba(30, 28, 65, 0.85)', 'rgba(20, 18, 45, 0.92)'] : ['rgba(255, 255, 255, 0.88)', 'rgba(245, 243, 255, 0.82)']}
              style={st.sheet}
            >
              <Text style={[st.h2, { color: th.ink }]}>عادة جديدة</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="اسم العادة"
                placeholderTextColor={th.mute}
                maxLength={30}
                style={[st.input, { backgroundColor: th.field, color: th.ink }]}
              />
              <Text style={[st.lab, { color: th.mute }]}>اختار رمز</Text>
              <View style={st.wrap}>
                {NAMES.map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => { Haptics.selectionAsync(); setIcon(n); }}
                    style={[
                      st.ib,
                      { backgroundColor: th.field },
                      icon === n && { borderColor: '#ffd54a', borderWidth: 2.5, backgroundColor: 'rgba(255, 213, 74, 0.25)' },
                    ]}
                  >
                    <Icon name={n} size={34} />
                  </Pressable>
                ))}
              </View>
              <Text style={[st.lab, { color: th.mute }]}>كام مرة في اليوم؟</Text>
              <View style={[st.row, { justifyContent: 'center' }]}>
                <Pressable onPress={() => { Haptics.selectionAsync(); setCnt(Math.max(1, cnt - 1)); }} style={[st.step, { backgroundColor: th.field }]}>
                  <Text style={[st.stepTxt, { color: th.ink }]}>−</Text>
                </Pressable>
                <Text style={[st.cnt, { color: th.ink }]}>{cnt}</Text>
                <Pressable onPress={() => { Haptics.selectionAsync(); setCnt(Math.min(20, cnt + 1)); }} style={[st.step, { backgroundColor: th.field }]}>
                  <Text style={[st.stepTxt, { color: th.ink }]}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={save} style={[st.go, { backgroundColor: '#ffd54a' }]}>
                <Text style={[st.goTxt, { color: INK }]}>أضف العادة</Text>
              </Pressable>
              <Pressable onPress={() => setAdd(false)} style={st.link}>
                <Text style={{ color: th.mute, fontWeight: '700' }}>إلغاء</Text>
              </Pressable>
            </LiquidGlass>
          </View>
        </Modal>

        {/* نافذة الاستيراد الزجاجية */}
        <Modal visible={imp} transparent animationType="slide" onRequestClose={() => setImp(false)}>
          <View style={st.back}>
            <LiquidGlass
              dark={dark}
              intensity={85}
              tintColors={dark ? ['rgba(30, 28, 65, 0.85)', 'rgba(20, 18, 45, 0.92)'] : ['rgba(255, 255, 255, 0.88)', 'rgba(245, 243, 255, 0.82)']}
              style={st.sheet}
            >
              <Text style={[st.h2, { color: th.ink }]}>استيراد من نسخة الويب</Text>
              <Text style={[st.lab, { color: th.mute }]}>في نسخة الويب: 📊 ثم انسخ. الصق النص هنا.</Text>
              <TextInput
                value={txt}
                onChangeText={setTxt}
                multiline
                placeholder="الصق النسخة الاحتياطية"
                placeholderTextColor={th.mute}
                style={[st.input, { backgroundColor: th.field, color: th.ink, height: 120, textAlignVertical: 'top' }]}
              />
              <Pressable onPress={doImport} style={[st.go, { backgroundColor: '#5fe0b7' }]}>
                <Text style={[st.goTxt, { color: INK }]}>استيراد</Text>
              </Pressable>
              <Pressable onPress={() => setImp(false)} style={st.link}>
                <Text style={{ color: th.mute, fontWeight: '700' }}>إلغاء</Text>
              </Pressable>
            </LiquidGlass>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const glassShadow = {
  shadowColor: '#0f0c29',
  shadowOpacity: 0.18,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

const st = StyleSheet.create({
  flex: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 999 },
  glassOuter: { overflow: 'hidden', ...glassShadow },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  h1: { fontSize: 34, fontWeight: '800', textAlign: 'right', marginBottom: 14 },
  h2: { fontSize: 22, fontWeight: '800', textAlign: 'right', marginBottom: 12 },
  lab: { fontSize: 15, fontWeight: '700', textAlign: 'right', marginTop: 14, marginBottom: 6 },
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  wrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  heroInner: { padding: 16, marginBottom: 20 },
  heroTxt: { fontSize: 18, fontWeight: '800', textAlign: 'right', marginBottom: 8 },
  lvTxt: { fontSize: 14, fontWeight: '700', textAlign: 'right', marginTop: 10, marginBottom: 6, opacity: 0.85 },
  bar: { height: 10, borderRadius: 10, backgroundColor: 'rgba(128,128,160,0.25)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 10 },
  cardInner: { padding: 16 },
  emo: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  nm: { fontSize: 20, fontWeight: '800', textAlign: 'right' },
  meta: { fontSize: 14, opacity: 0.75, textAlign: 'right', marginTop: 2 },
  big: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  bigDown: { transform: [{ scale: 0.94 }] },
  bigTxt: { fontSize: 22, fontWeight: '800' },
  track: { height: 10, borderRadius: 10, marginVertical: 14, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 10 },
  wd: { flex: 1, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 3 },
  wdTxt: { fontSize: 13, fontWeight: '700' },
  empty: { textAlign: 'center', fontSize: 17, fontWeight: '600' },
  link: { alignItems: 'center', padding: 14 },
  dev: { textAlign: 'center', fontSize: 14, fontWeight: '700', marginTop: 4 },
  fabWrap: { position: 'absolute', alignSelf: 'center', bottom: 28 },
  fabGlass: { height: 60, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
  fabDown: { transform: [{ scale: 0.96 }] },
  fabTxt: { fontSize: 20, fontWeight: '800', color: INK },
  back: { flex: 1, backgroundColor: 'rgba(10, 8, 30, 0.55)', justifyContent: 'flex-end' },
  sheet: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: 22, paddingBottom: 36 },
  input: { borderRadius: 16, padding: 14, fontSize: 17, textAlign: 'right', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  ib: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  step: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  stepTxt: { fontSize: 26, fontWeight: '800' },
  cnt: { fontSize: 28, fontWeight: '800', minWidth: 60, textAlign: 'center' },
  go: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  goTxt: { fontSize: 20, fontWeight: '800' },
});