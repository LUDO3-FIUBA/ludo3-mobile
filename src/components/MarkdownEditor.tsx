import React, { useMemo, useState, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcon from './materialIcon';
import Markdown from 'react-native-markdown-display';

type Selection = { start: number; end: number };

type MarkdownEditorProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  previewLabel?: string;
};

type MarkdownAction = {
  label: string;
  insert: (value: string, selection: Selection) => { text: string; selection: Selection };
};

const DEFAULT_SELECTION = { start: 0, end: 0 };

const wrapSelection = (
  value: string,
  selection: Selection,
  prefix: string,
  suffix = prefix,
  placeholder = '',
) => {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  const selectedText = value.slice(start, end) || placeholder;
  const nextText = `${value.slice(0, start)}${prefix}${selectedText}${suffix}${value.slice(end)}`;
  const cursorStart = start + prefix.length;
  const cursorEnd = cursorStart + selectedText.length;

  return {
    text: nextText,
    selection: { start: cursorStart, end: cursorEnd },
  };
};

const insertBlock = (
  value: string,
  selection: Selection,
  prefix: string,
  suffix = '',
  placeholder = '',
) => {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  const selectedText = value.slice(start, end) || placeholder;
  const needsLeadingNewLine = start > 0 && value[start - 1] !== '\n';
  const needsTrailingNewLine = end < value.length && value[end] !== '\n';
  const leading = needsLeadingNewLine ? '\n' : '';
  const trailing = needsTrailingNewLine ? '\n' : '';
  const nextText = `${value.slice(0, start)}${leading}${prefix}${selectedText}${suffix}${trailing}${value.slice(end)}`;
  const cursorStart = start + leading.length + prefix.length;
  const cursorEnd = cursorStart + selectedText.length;

  return {
    text: nextText,
    selection: { start: cursorStart, end: cursorEnd },
  };
};

const actionButtons: Array<MarkdownAction & { icon: string } > = [
  {
    label: 'Bold',
    icon: 'format-bold',
    insert: (value, selection) => wrapSelection(value, selection, '**', '**', 'negrita'),
  },
  {
    label: 'Italic',
    icon: 'format-italic',
    insert: (value, selection) => wrapSelection(value, selection, '*', '*', 'cursiva'),
  },
  {
    label: 'H1',
    icon: 'format-header-1',
    insert: (value, selection) => insertBlock(value, selection, '# ', '', 'Título'),
  },
  {
    label: 'Quote',
    icon: 'format-quote-open',
    insert: (value, selection) => insertBlock(value, selection, '> ', '', 'Cita'),
  },
  {
    label: 'Code',
    icon: 'code-tags',
    insert: (value, selection) => wrapSelection(value, selection, '`', '`', 'código'),
  },
  {
    label: 'Link',
    icon: 'link',
    insert: (value, selection) => wrapSelection(value, selection, '[', '](https://)', 'texto'),
  },
  {
    label: 'List',
    icon: 'format-list-bulleted',
    insert: (value, selection) => insertBlock(value, selection, '- ', '', 'Elemento'),
  },
  {
    label: '1.',
    icon: 'format-list-numbered',
    insert: (value, selection) => insertBlock(value, selection, '1. ', '', 'Elemento'),
  },
  {
    label: 'Table',
    icon: 'table',
    insert: (value, selection) => insertBlock(
      value,
      selection,
      '| Columna 1 | Columna 2 |\n| --- | --- |\n| Dato | Dato |',
      '',
      '',
    ),
  },
  {
    label: 'Code block',
    icon: 'code-tags',
    insert: (value, selection) => insertBlock(value, selection, '```\n', '\n```', 'Código'),
  },
  {
    label: 'Strike',
    icon: 'format-strikethrough',
    insert: (value, selection) => wrapSelection(value, selection, '~~', '~~', 'tachado'),
  },
];

export default function MarkdownEditor({
  label,
  value,
  onChangeText,
  placeholder = 'Escribí en Markdown...',
  helperText = 'Usá la barra para dar formato y ver el resultado abajo.',
  previewLabel = 'Vista previa',
}: MarkdownEditorProps) {
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION);
  const inputRef = useRef<any>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const MOVE_THRESHOLD = 8; // px

  const markdownStyles = useMemo(
    () => ({
      body: styles.previewBody,
      heading1: styles.heading1,
      heading2: styles.heading2,
      heading3: styles.heading3,
      paragraph: styles.paragraph,
      strong: styles.strong,
      em: styles.em,
      blockquote: styles.blockquote,
      code_inline: styles.codeInline,
      code_block: styles.codeBlock,
      fence: styles.codeBlock,
      bullet_list: styles.list,
      ordered_list: styles.list,
      list_item: styles.listItem,
      link: styles.link,
      table: styles.table,
      tr: styles.tableRow,
      th: styles.tableHeader,
      td: styles.tableCell,
    }),
    [],
  );

  const applyAction = (action: MarkdownAction) => {
    const next = action.insert(value, selection);
    onChangeText(next.text);
    setSelection(next.selection);
    // restore focus to the input so the keyboard stays open and caret is placed
    if (inputRef.current && typeof inputRef.current.focus === 'function') {
      // small delay to ensure native keyboard state updates, helps on Android
      setTimeout(() => inputRef.current.focus(), 50);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolbar}
        keyboardShouldPersistTaps="always"
      >
        {actionButtons.map((action) => (
          <Pressable
            key={action.label}
            onPressIn={(e) => {
              const ev = e.nativeEvent as any;
              touchStartRef.current = { x: ev.pageX, y: ev.pageY };
            }}
            onPressOut={(e) => {
              const ev = e.nativeEvent as any;
              const start = touchStartRef.current;
              touchStartRef.current = null;
              if (start) {
                const dx = Math.abs(ev.pageX - start.x);
                const dy = Math.abs(ev.pageY - start.y);
                if (dx <= MOVE_THRESHOLD && dy <= MOVE_THRESHOLD) {
                  applyAction(action);
                }
              } else {
                applyAction(action);
              }
            }}
            style={styles.toolbarButton}
            accessibilityLabel={action.label}
          >
            <MaterialIcon name={action.icon} fontSize={18} color="#1f2937" />
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        multiline
        textAlignVertical="top"
        value={value}
        onChangeText={onChangeText}
        ref={inputRef}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
        selection={selection}
        placeholder={placeholder}
        placeholderTextColor="#808080"
      />
      <Text style={styles.helperText}>{helperText}</Text>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>{previewLabel}</Text>
        {value.trim() ? (
          <Markdown style={markdownStyles}>{value}</Markdown>
        ) : (
          <Text style={styles.previewEmpty}>Todavía no hay contenido para previsualizar.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 6,
  },
  toolbarButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  toolbarButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  input: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 15,
    lineHeight: 21,
  },
  helperText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: -2,
  },
  previewCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#f8fafc',
    gap: 8,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  previewBody: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 22,
  },
  previewEmpty: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  heading1: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heading2: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  heading3: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
  },
  strong: {
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#9ca3af',
    paddingLeft: 12,
    marginVertical: 8,
    color: '#374151',
  },
  codeInline: {
    backgroundColor: '#e5e7eb',
    color: '#111827',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  codeBlock: {
    backgroundColor: '#111827',
    color: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  list: {
    marginVertical: 6,
  },
  listItem: {
    marginBottom: 4,
  },
  link: {
    color: '#0f766e',
    textDecorationLine: 'underline',
  },
  table: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    flex: 1,
    padding: 8,
    backgroundColor: '#e5e7eb',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
    fontWeight: '700',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
});