import Login from 'src/pages/auth/Login';
import FilesList from 'src/pages/files/FilesList';
import FileDetails from 'src/pages/files/FileDetails';
import FilePrint from 'src/pages/files/FilePrint';
import MyCjkList from 'src/pages/my-cjk/MyCjkList';
import DictionarySearch from 'src/pages/dictionary/Search';
import DictionaryDetails from 'src/pages/dictionary/Details';
import Config from 'src/pages/config/Config';
import VideoShow from 'src/pages/video/Show';

import About from 'src/pages/about/About';
import Browser from 'src/pages/browser/Browser';
import NotFound from 'src/pages/NotFound';

export default [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: {
      hideTopBar: true,
      redirectTo: '/#/files',
    },
  },
  {
    path: '/login/baidu',
    name: 'login-baidu',
    component: Login,
    meta: {
      hideTopBar: true,
    },
  },
  {
    path: '/files',
    name: 'files',
    component: FilesList,
    meta: {
      protected: true,
    },
  },
  {
    path: '/files/file/:filename',
    name: 'file',
    component: FileDetails,
    meta: {
      protected: true,
      topBar: 'file-details',
    },
  },
  {
    path: '/files/print/:filename',
    name: 'print',
    component: FilePrint,
    meta: {
      protected: true,
      topBar: 'file-print',
    },
  },
  {
    path: '/my-cjk',
    name: 'my-cjk',
    component: MyCjkList,
    meta: {
      protected: true,
    },
  },
  {
    path: '/dictionary',
    name: 'dictionary',
    component: DictionarySearch,
    meta: {
      topBar: 'dictionary',
    },
  },
  {
    path: '/dictionary-details/:id',
    name: 'dictionary-details',
    component: DictionaryDetails,
    meta: {
      topBar: 'dictionary',
    },
  },
  {
    path: '/config',
    name: 'config',
    component: Config,
    meta: {
      protected: true,
    },
  },
  {
    path: '/video',
    name: 'video',
    component: VideoShow,
    meta: {
      topBar: 'videos',
      protected: true,
    },
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: {},
  },
  {
    path: '/browser',
    name: 'browser',
    component: Browser,
    meta: {
      topBarLeft: true,
      hideTitle: true,
      topBar: 'browser',
    },
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound,
  },
];
