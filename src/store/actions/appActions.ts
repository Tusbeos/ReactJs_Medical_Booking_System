import actionTypes from './actionTypes';

export const appStartUpComplete = () => ({
    type: actionTypes.APP_START_UP_COMPLETE as typeof actionTypes.APP_START_UP_COMPLETE
});

export const setContentOfConfirmModal = (contentOfConfirmModal: any) => ({
    type: actionTypes.SET_CONTENT_OF_CONFIRM_MODAL as typeof actionTypes.SET_CONTENT_OF_CONFIRM_MODAL,
    contentOfConfirmModal: contentOfConfirmModal
});

export const changeLanguageApp = (languageInput: string) => ({
  type: actionTypes.CHANGE_LANGUAGE as typeof actionTypes.CHANGE_LANGUAGE,
  language: languageInput,
});