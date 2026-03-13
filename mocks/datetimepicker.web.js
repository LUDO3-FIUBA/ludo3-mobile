// Mock for @react-native-community/datetimepicker on web
// Shows an input + Confirm button so partial edits don't auto-accept
import React, { useState } from 'react';

const DateTimePicker = ({ value, mode, onChange, minuteInterval }) => {
  const toDateString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const toTimeString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  };

  const initialValue = mode === 'time' ? toTimeString(value) : toDateString(value);
  const [inputValue, setInputValue] = useState(initialValue);

  const handleConfirm = () => {
    if (!inputValue) return;
    let newDate = value ? new Date(value) : new Date();

    if (mode === 'date') {
      const [year, month, day] = inputValue.split('-').map(Number);
      newDate = new Date(newDate);
      newDate.setFullYear(year, month - 1, day);
    } else if (mode === 'time') {
      const [hours, minutes] = inputValue.split(':').map(Number);
      newDate = new Date(newDate);
      newDate.setHours(hours, minutes, 0, 0);
    }

    onChange({ type: 'set' }, newDate);
  };

  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 } },
    React.createElement('input', {
      type: mode === 'time' ? 'time' : 'date',
      value: inputValue,
      step: mode === 'time' && minuteInterval ? minuteInterval * 60 : undefined,
      onChange: (e) => setInputValue(e.target.value),
      autoFocus: true,
      style: {
        fontSize: 16,
        padding: 8,
        borderRadius: 5,
        border: '1px solid grey',
      },
    }),
    React.createElement(
      'button',
      {
        onClick: handleConfirm,
        style: {
          padding: '8px 14px',
          borderRadius: 5,
          border: 'none',
          backgroundColor: '#1a73e8',
          color: 'white',
          fontSize: 14,
          cursor: 'pointer',
        },
      },
      'OK'
    )
  );
};

export default DateTimePicker;
