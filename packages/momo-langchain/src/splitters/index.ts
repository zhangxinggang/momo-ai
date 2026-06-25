import { ESplitterKind } from '../constants';
import { registerSplitter } from '../core/factory';
import { RecursiveCharacterSplitter } from './recursive-character';

registerSplitter(ESplitterKind.ERecursiveCharacter, () => new RecursiveCharacterSplitter());

export { RecursiveCharacterSplitter, splitTextRecursive } from './recursive-character';
