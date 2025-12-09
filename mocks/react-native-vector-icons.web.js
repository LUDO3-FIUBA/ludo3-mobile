import React from 'react';
import { View, Text } from 'react-native';
import * as MaterialCommunityIcons from 'react-icons/md';
import * as MaterialIcons from 'react-icons/md';

// Map of common icon names from react-native-vector-icons to react-icons
const iconMap = {
  'filter': MaterialIcons.MdFilterList,
  'calendar': MaterialIcons.MdCalendarToday,
  'calendar-outline': MaterialIcons.MdCalendarToday,
  'calendar-today': MaterialIcons.MdCalendarToday,
  'calendar-clock': MaterialIcons.MdSchedule,
  'calendar-edit': MaterialIcons.MdEditCalendar,
  'account': MaterialIcons.MdPerson,
  'account-circle': MaterialIcons.MdAccountCircle,
  'account-supervisor': MaterialIcons.MdSupervisorAccount,
  'account-group': MaterialIcons.MdGroup,
  'check': MaterialIcons.MdCheck,
  'check-circle': MaterialIcons.MdCheckCircle,
  'close': MaterialIcons.MdClose,
  'menu': MaterialIcons.MdMenu,
  'home': MaterialIcons.MdHome,
  'home-outline': MaterialIcons.MdHomeOutlined,
  'school': MaterialIcons.MdSchool,
  'book': MaterialIcons.MdBook,
  'chevron-right': MaterialIcons.MdChevronRight,
  'chevron-left': MaterialIcons.MdChevronLeft,
  'arrow-right': MaterialIcons.MdArrowForward,
  'arrow-left': MaterialIcons.MdArrowBack,
  'dots-vertical': MaterialIcons.MdMoreVert,
  'pencil': MaterialIcons.MdEdit,
  'delete': MaterialIcons.MdDelete,
  'plus': MaterialIcons.MdAdd,
  'camera': MaterialIcons.MdCamera,
  'qrcode-scan': MaterialIcons.MdQrCodeScanner,
  'information-outline': MaterialIcons.MdInfoOutline,
  'note-multiple': MaterialIcons.MdNote,
  'text-box-multiple': MaterialIcons.MdDashboard,
  'text-box-multiple-outline': MaterialIcons.MdDashboardOutlined,
  'text-box-check': MaterialIcons.MdCheckBox,
  'text-box-check-outline': MaterialIcons.MdCheckBoxOutlineBlank,
  'file-clock': MaterialIcons.MdSchedule,
  'file-clock-outline': MaterialIcons.MdScheduleOutlined,
  'face-recognition': MaterialIcons.MdFace,
  'chart-box': MaterialIcons.MdBarChart,
  'chart-box-outline': MaterialIcons.MdBarChartOutlined,
  'logout-variant': MaterialIcons.MdLogout,
  'graph-outline': MaterialIcons.MdShowChart,
  'trophy': MaterialIcons.MdEmojiEvents,
  'trophy-award': MaterialIcons.MdEmojiEvents,
};

// Web-compatible Icon component
const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
  const IconComponent = iconMap[name] || MaterialIcons.MdHelp;
  
  return (
    <View style={[{ width: size, height: size }, style]}>
      <IconComponent 
        size={size} 
        color={color || style?.color} 
        style={{ display: 'block' }}
      />
    </View>
  );
};

Icon.loadFont = () => {
  // No-op for web, fonts are loaded via npm package
};

export default Icon;

