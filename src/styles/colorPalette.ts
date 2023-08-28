const facultyColors = {
  darkGray: '#333333',
  lightGray: '#d9d9d9',
  institutional: '#0088cc',
  careers: '#ff9900',
  postgraduate: '#99ff00',
  investigation: '#800000',
  wellbeing: '#6640ff',
  black: '#000000',
};

const sharedColors = {
  ...facultyColors,
  menuOpener: facultyColors.wellbeing,
  menuOption: facultyColors.investigation,
};

export const lightModeColors = {
  mainColor: sharedColors.institutional,
  mainContrastColor: '#211e16',
  secondaryColor: sharedColors.careers,
  secondaryContrastColor: '#211e16',
  ...sharedColors,
};

export const darkModeColors = {
  mainColor: sharedColors.institutional,
  mainContrastColor: 'white',
  secondaryColor: sharedColors.careers,
  secondaryContrastColor: 'white',
  ...sharedColors,
};
