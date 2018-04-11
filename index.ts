/**
 * Created by user on 2018/4/12/012.
 */

import * as Promise from 'bluebird';

import projectConfig from './project.config';
import * as path from 'path';

import requireLoader, { requireModule as requireLoaderModule } from './lib/loader';
export { requireLoader, requireLoaderModule }

import getDictPath from './lib/dict';
export { getDictPath }

export const ROOT = projectConfig.project_root;
export const DICT_ROOT = projectConfig.dict_root;

import * as self from './index';
export default self;
