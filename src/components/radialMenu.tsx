import React, { useEffect, useState, useRef } from 'react';
import { Animated, PanResponder, View, PanResponderInstance, PanResponderGestureState, NativeSyntheticEvent } from 'react-native';

interface RadialMenuProps {
  itemRadius?: number;
  menuRadius?: number;
  spreadAngle?: number;
  startAngle?: number;
  opened?: boolean;
  onOpen?: () => void;
  onOpened?: () => void;
  onClose?: () => void;
  onClosed?: () => void;
  children: React.ReactNode;
  style?: any;
}

const generateRadialPositions = (
  count: number,
  radius: number,
  spread_angle: number,
  start_angle: number
) => {
  const span = spread_angle < 360 ? 1 : 0;
  const start = (start_angle * Math.PI) / 180;
  const rad = (spread_angle * Math.PI * 2) / 360 / (count - span);
  return [...Array(count)].map((_, i) => ({
    x: -Math.cos(start + rad * i) * radius,
    y: -Math.sin(start + rad * i) * radius,
  }));
};

const RadialMenu: React.FC<RadialMenuProps> = ({
  itemRadius = 30,
  menuRadius = 100,
  spreadAngle = 360,
  startAngle = 0,
  opened = false,
  onOpen = () => {},
  onOpened = () => {},
  onClose = () => {},
  onClosed = () => {},
  children,
  style,
}) => {
  const [RMOpening, setRMOpening] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const panResponder = useRef<PanResponderInstance | null>(null);

  const childrenArray = React.Children.toArray(children);
  const initial_spots = generateRadialPositions(
    childrenArray.length - 1,
    menuRadius,
    spreadAngle,
    startAngle
  );
  initial_spots.unshift({ x: 0, y: 0 });

  const [item_anims] = useState(
    initial_spots.map(
      (_, i) => new Animated.ValueXY({ x: 0, y: 0 })
    )
  );

  useEffect(() => {
    if (opened) {
      openMenu();
    }
  }, [opened]);

  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        openMenu();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: item_anims[0].x, dy: item_anims[0].y }],
        {
          listener: (event: NativeSyntheticEvent<any>) => {
            const gestureState = event.nativeEvent; // Assuming gestureState is in nativeEvent
            itemPanListener(event, gestureState);
          },
          useNativeDriver: true,
        }
      ),
      onPanResponderRelease: () => releaseItem(),
      onPanResponderTerminate: () => releaseItem(),
    });
  }, []);

  const itemPanListener = (event: NativeSyntheticEvent<unknown>, gestureState: PanResponderGestureState): any => {
    let newSelected = null;
    if (!RMOpening) {
      newSelected = computeNewSelected(gestureState);
      if (selectedItem !== newSelected) {
        setSelectedItem(newSelected);
      }
    }
  };

  const openMenu = () => {
    onOpen();
    setRMOpening(true);
    Animated.stagger(
      20,
      initial_spots.map((spot, idx) =>
        Animated.spring(item_anims[idx], {
          toValue: spot,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        })
      )
    ).start(() => {
      onOpened();
      setRMOpening(false);
    });
  };

  const releaseItem = () => {
    onClose();
    if (selectedItem === null) return;

    const selectedChild = childrenArray[selectedItem];
    
    if (React.isValidElement(selectedChild)) {
      const reactElement = selectedChild as React.ReactElement; // Explicit type cast
      if ('onSelect' in reactElement.props) {
        reactElement.props.onSelect();
      }
    }
  
    setSelectedItem(null);
  
    Animated.parallel(
      item_anims.map(item =>
        Animated.spring(item, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        })
      )
    ).start(onClosed);
  };
  
  

  const computeNewSelected = (gestureState: any) => {
    const { dx, dy } = gestureState;
    let minDist = Infinity;
    let newSelected = null;

    const pointRadius = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(menuRadius - pointRadius) < menuRadius / 2) {
      initial_spots.forEach((spot, idx) => {
        const delta = { x: spot.x - dx, y: spot.y - dy };
        const dist = delta.x * delta.x + delta.y * delta.y;
        if (dist < minDist) {
          minDist = dist;
          newSelected = idx;
        }
      });
    }

    return newSelected;
  };

  return (
    <View style={[style]}>
      {item_anims.map((_, i) => {
        const j = item_anims.length - i - 1;
        const handlers = panResponder.current?.panHandlers || {};
        return (
          <Animated.View
            {...handlers}
            key={i}
            style={{
              transform: item_anims[j].getTranslateTransform(),
              position: 'absolute',
            }}
          >
            {childrenArray[j]}
          </Animated.View>
        );
      })}
    </View>
  );
};

export default RadialMenu;
