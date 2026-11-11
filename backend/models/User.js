import bcrypt from 'bcryptjs';
import { createTursoModel } from '../config/tursoModel.js';

const User = createTursoModel('User', 'users', {
  defaults: {
    role: 'customer',
    avatar: '',
    provider: 'local',
    authProvider: 'local',
    emailVerified: false,
    isVerified: true,
    isActive: true,
    addresses: [],
    refreshToken: null,
  },
  preSave: async function () {
    if (this.provider && !this.authProvider) this.authProvider = this.provider;
    if (this.authProvider && !this.provider) this.provider = this.authProvider;

    const pwd = this.password || this._data?.password;
    if (pwd && !pwd.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(pwd, salt);
      this.password = hashed;
      if (this._data) this._data.password = hashed;
    }
  },
  methods: {
    matchPassword: async function (enteredPassword) {
      const pwd = this.password || this._data?.password;
      if (!pwd) return false;
      return await bcrypt.compare(enteredPassword, pwd);
    },
  },
});

export default User;
