import {  useWebApp  } from "vue-tg"
const {  initDataUnsafe  } = useWebApp()

export const tg_style = (par) => { 
    if (Object.entries(initDataUnsafe).length > 0) { 
        switch (par) { 
            case 'bg_color':
                return { 'background-color': 'var(--tg-theme-bg-color)' }
            case 'text_color':
                return { 'color': 'var(--tg-theme-text-color)' }
            case 'bg_text_color':
                    return { 'background-color': 'var(--tg-theme-text-color)' }
            case 'hint_color':
                return { 'color': 'var(--tg-theme-hint-color)' }
            case 'link_color':
                return { 'color': 'var(--tg-theme-link-color)' }
            case 'button_color':
                return { 'background-color': 'var(--tg-theme-button-color)' }
            case 'button_text_color':
                return { 'color': 'var(--tg-theme-button-text-color)' }
            case 'secondary_bg_color':
                return { 'background-color': 'var(--tg-theme-secondary-bg-color)' }
            case 'input':
                return { 
                    'background-color': 'var(--tg-theme-secondary-bg-color)',
                    'color': 'var(--tg-theme-text-color)'
                }
         }
     } else { 
        switch (par) { 
            case 'bg_color':
                return { 'background-color': 'white' }
            case 'text_color':
                return { 'color': '#212121' }
            case 'bg_text_color':
                return { 'background-color': '#212121' }
            case 'hint_color':
                return { 'color': '#607D8B' }
            case 'link_color':
                return { 'color': '#2196F3' }
            case 'button_color':
                return { 'background-color': '#4CAF50' }
            case 'button_text_color':
                return { 'color': 'white' }
            case 'secondary_bg_color':
                return { 'background-color': '#FAFAFA' }
            case 'input':
                return { 
                    'background-color': '#FAFAFA',
                    'color': '#212121'
                }
         }
     }
 }