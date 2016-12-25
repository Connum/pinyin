import Login from 'src/pages/auth/Login';
import FilesList from 'src/pages/files/FilesList';
import FileDetails from 'src/pages/files/FileDetails';
import FilePrint from 'src/pages/files/FilePrint';
import MyCjkList from 'src/pages/my-cjk/MyCjkList';

export default [
  {
    path: '/',
    name: 'login',
    component: Login,
  },
  {
    path: '/files',
    name: 'files',
    component: FilesList,
  },
  {
    path: '/files/file/:filename',
    name: 'file',
    component: FileDetails,
  },
  {
    path: '/files/print/:filename',
    name: 'print',
    component: FilePrint,
  },
  {
    path: '/my_cjk',
    name: 'my_cjk',
    component: MyCjkList,
  },
];
