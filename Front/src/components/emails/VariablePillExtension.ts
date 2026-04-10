import { Node, mergeAttributes } from '@tiptap/core';

export interface VariablePillOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variablePill: {
      setVariablePill: (attributes: { tag: string; description: string }) => ReturnType,
    }
  }
}

export const VariablePill = Node.create<VariablePillOptions>({
  name: 'variablePill',
  group: 'inline',
  inline: true,
  selectable: false, 
  atom: true, 

  addAttributes() {
    return {
      tag: {
        default: null,
        parseHTML: element => element.getAttribute('data-tag'),
        renderHTML: attributes => ({ 'data-tag': attributes.tag }),
      },
      description: {
        default: null,
        parseHTML: element => element.textContent,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-tag]', 
      },
    ]
  },

 renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'variable-pill' }), HTMLAttributes.description];
  },

  addCommands() {
    return {
      setVariablePill: attributes => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        })
      },
    }
  },
})