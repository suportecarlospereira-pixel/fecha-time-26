import { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { supabase, Player, CallUp, Profile, Position, SkillLevel, GameType, POSITION_LABELS, SKILL_LABELS, GAME_TYPE_LABELS, CallUpApplication, Hire } from './lib/supabase';
import {
  User, Users, Calendar, MapPin, Phone, Star, Search, Filter, Plus, X,
  ChevronRight, MessageCircle, Clock, DollarSign, Edit, LogOut, Home,
  Trophy, Target, Send, Check, ArrowLeft, Menu, UserPlus, Camera, Lock, Briefcase
} from 'lucide-react';

type Screen = 'home' | 'login' | 'signup' | 'players' | 'player-detail' | 'call-ups' | 'call-up-detail' | 'create-call-up' | 'profile' | 'my-applications' | 'hire-player' | 'my-hires';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedCallUp, setSelectedCallUp] = useState<CallUp | null>(null);

  useEffect(() => {
    if (!loading && !user && screen !== 'login' && screen !== 'signup') {
      setScreen('home');
    }
  }, [user, loading, screen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleNavigate = (newScreen: Screen, data?: Player | CallUp) => {
    if (data && 'primary_position' in data) {
      setSelectedPlayer(data as Player);
    } else if (data && 'organizer_id' in data) {
      setSelectedCallUp(data as CallUp);
    }
    setScreen(newScreen);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-green-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => handleNavigate('home')} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white">Fecha Time</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('profile')}
                className="hidden sm:flex items-center gap-2 text-white hover:text-green-400 transition-colors"
              >
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="text-sm">{profile?.name || 'Perfil'}</span>
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white hover:text-green-400 transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavigate('login')}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-gray-900 border-l border-green-500/20 p-4 flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 text-white hover:text-green-400">
              <X className="w-6 h-6" />
            </button>

            <div className="mt-12 space-y-2">
              <MenuItem icon={Home} label="Início" onClick={() => handleNavigate('home')} />
              <MenuItem icon={Users} label="Jogadores" onClick={() => handleNavigate('players')} />
              <MenuItem icon={Calendar} label="Convocações" onClick={() => handleNavigate('call-ups')} />
              <MenuItem icon={Plus} label="Criar Convocação" onClick={() => handleNavigate('create-call-up')} />
              <MenuItem icon={Send} label="Minhas Inscrições" onClick={() => handleNavigate('my-applications')} />
              <MenuItem icon={Briefcase} label="Minhas Contratações" onClick={() => handleNavigate('my-hires')} />
              <MenuItem icon={User} label="Meu Perfil" onClick={() => handleNavigate('profile')} />
            </div>

            <div className="mt-auto">
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {screen === 'home' && <HomeScreen user={user} profile={profile} onNavigate={handleNavigate} />}
        {screen === 'login' && <LoginScreen onNavigate={handleNavigate} />}
        {screen === 'signup' && <SignupScreen onNavigate={handleNavigate} />}
        {screen === 'players' && <PlayersScreen onNavigate={handleNavigate} />}
        {screen === 'player-detail' && selectedPlayer && <PlayerDetailScreen player={selectedPlayer} onNavigate={handleNavigate} />}
        {screen === 'call-ups' && <CallUpsScreen user={user} profile={profile} onNavigate={handleNavigate} />}
        {screen === 'call-up-detail' && selectedCallUp && <CallUpDetailScreen callUp={selectedCallUp} user={user} profile={profile} onNavigate={handleNavigate} />}
        {screen === 'create-call-up' && profile && <CreateCallUpScreen profile={profile} onNavigate={handleNavigate} />}
        {screen === 'profile' && user && profile && <ProfileScreen profile={profile} onNavigate={handleNavigate} />}
        {screen === 'my-applications' && user && profile && <MyApplicationsScreen profile={profile} onNavigate={handleNavigate} />}
        {screen === 'hire-player' && selectedPlayer && user && profile && <HirePlayerScreen player={selectedPlayer} profile={profile} onNavigate={handleNavigate} />}
        {screen === 'my-hires' && user && profile && <MyHiresScreen profile={profile} onNavigate={handleNavigate} />}
      </main>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: typeof User; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 text-white hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

function HomeScreen({ user, profile, onNavigate }: { user: any; profile: Profile | null; onNavigate: (screen: Screen, data?: Player | CallUp) => void }) {
  const [recentCallUps, setRecentCallUps] = useState<CallUp[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [callUpsRes, playersRes] = await Promise.all([
        supabase.from('call_ups').select('*, profiles!call_ups_organizer_id_fkey(*)').eq('status', 'open').order('created_at', { ascending: false }).limit(6),
        supabase.from('players').select('*, profiles(*)').eq('is_available', true).gt('rating_avg', 0).order('rating_avg', { ascending: false }).limit(4)
      ]);
      if (callUpsRes.data) setRecentCallUps(callUpsRes.data as unknown as CallUp[]);
      if (playersRes.data) setTopPlayers(playersRes.data as unknown as Player[]);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8 sm:py-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Encontre jogadores para sua <span className="text-green-400">pelada</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Conecte organizadores e jogadores por posição, local e nível. Feche seu time em minutos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate('players')}
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Ver Jogadores
          </button>
          <button
            onClick={() => onNavigate(user ? 'create-call-up' : 'login')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Convocação
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
        <FeatureCard icon={Target} title="Por Posição" description="Encontre goleiro, zagueiro, atacante..." />
        <FeatureCard icon={MapPin} title="Por Local" description="Filtre por cidade e bairro" />
        <FeatureCard icon={Star} title="Por Nível" description="Iniciante até profissional" />
      </div>

      {/* Recent Call-ups */}
      {recentCallUps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Convocações Abertas</h2>
            <button onClick={() => onNavigate('call-ups')} className="text-green-400 hover:text-green-300 flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCallUps.map(callUp => (
              <CallUpCard key={callUp.id} callUp={callUp} onClick={() => onNavigate('call-up-detail', callUp)} />
            ))}
          </div>
        </section>
      )}

      {/* Top Players */}
      {topPlayers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Jogadores Bem Avaliados</h2>
            <button onClick={() => onNavigate('players')} className="text-green-400 hover:text-green-300 flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPlayers.map(player => (
              <PlayerCard key={player.id} player={player} onClick={() => onNavigate('player-detail', player)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Target; title: string; description: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-colors">
      <Icon className="w-8 h-8 text-green-400 mb-3" />
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function LoginScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError('Email ou senha incorretos');
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Entrar</h1>
        <p className="text-gray-400 mb-6">Acesse sua conta para gerenciar seu perfil</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Sua senha"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Não tem conta?{' '}
            <button onClick={() => onNavigate('signup')} className="text-green-400 hover:text-green-300 font-medium">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const TIME_SLOTS = [
  '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
  '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00'
];

function SignupScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'player' | 'organizer'>('player');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [primaryPosition, setPrimaryPosition] = useState<Position>('midfielder');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [gameTypes, setGameTypes] = useState<GameType[]>(['society']);
  const [pricePerGame, setPricePerGame] = useState('');
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const toggleGameType = (type: GameType) => {
    setGameTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTimeSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const newSlots = daySlots.includes(slot)
        ? daySlots.filter(s => s !== slot)
        : [...daySlots, slot];
      return { ...prev, [day]: newSlots };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gameTypes.length === 0) {
      setError('Selecione pelo menos um tipo de jogo');
      return;
    }
    setError(null);
    setLoading(true);

    const profileData = {
      user_type: userType,
      name,
      whatsapp: whatsapp || null,
      city,
      neighborhood,
    };

    const { error: signUpError } = await signUp(email, password, profileData);

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message || 'Erro ao criar conta');
      return;
    }

    if (userType === 'player') {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.from('players').insert({
          id: user.id,
          primary_position: primaryPosition,
          secondary_positions: [],
          skill_level: skillLevel,
          game_types: gameTypes,
          price_per_game: pricePerGame ? parseFloat(pricePerGame) : null,
          availability: availability,
          is_available: true,
        });
      }
    }

    setLoading(false);
    onNavigate('home');
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <button onClick={() => step > 1 ? setStep(step - 1) : onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {step > 1 ? 'Voltar' : 'Início'}
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-green-500' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Tipo de conta</h1>
            <p className="text-gray-400 mb-6">Como você vai usar o Fecha Time?</p>

            <div className="space-y-3">
              <button
                onClick={() => { setUserType('player'); setStep(2); }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${userType === 'player' ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-white/40'}`}
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Jogador</p>
                  <p className="text-gray-400 text-sm">Quero ser encontrado para peladas</p>
                </div>
              </button>
              <button
                onClick={() => { setUserType('organizer'); setStep(2); }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${userType === 'organizer' ? 'border-green-500 bg-green-500/10' : 'border-white/20 hover:border-white/40'}`}
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Organizador</p>
                  <p className="text-gray-400 text-sm">Quero convocar jogadores</p>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Seus dados</h1>
            <p className="text-gray-400 mb-6">Informações básicas do seu perfil</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Cidade *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Bairro *</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                    placeholder="Centro"
                  />
                </div>
              </div>

              {userType === 'player' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Posição principal *</label>
                    <select
                      value={primaryPosition}
                      onChange={e => setPrimaryPosition(e.target.value as Position)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                    >
                      {Object.entries(POSITION_LABELS).map(([value, label]) => (
                        <option key={value} value={value} className="bg-gray-800">{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nível de jogo *</label>
                    <select
                      value={skillLevel}
                      onChange={e => setSkillLevel(e.target.value as SkillLevel)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                    >
                      {Object.entries(SKILL_LABELS).map(([value, label]) => (
                        <option key={value} value={value} className="bg-gray-800">{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Tipos de jogo *</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(GAME_TYPE_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleGameType(value as GameType)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${gameTypes.includes(value as GameType) ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => userType === 'player' ? setStep(3) : setStep(4)}
                disabled={!name || !city || !neighborhood}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold py-3 rounded-lg transition-colors"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 3 && userType === 'player' && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Disponibilidade</h1>
            <p className="text-gray-400 mb-6">Configure seus horários e valor</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Valor por partida (R$)</label>
                <input
                  type="number"
                  value={pricePerGame}
                  onChange={e => setPricePerGame(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  placeholder="Ex: 50,00 (deixe vazio para combinar)"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Horários Disponíveis</label>
                <p className="text-gray-500 text-xs mb-2">Clique nos horários que você está disponível</p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-hide">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day.key} className="bg-white/5 rounded-lg p-2">
                      <p className="text-gray-300 text-xs font-medium mb-1">{day.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {TIME_SLOTS.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleTimeSlot(day.key, slot)}
                            className={`px-2 py-1 rounded text-xs transition-all ${(availability[day.key] || []).includes(slot) ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                            {slot.split('-')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(4)}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-colors"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Criar conta</h1>
            <p className="text-gray-400 mb-6">Defina seu email e senha</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Senha *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email || password.length < 6}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Criando...' : 'Criar conta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Já tem conta?{' '}
                <button onClick={() => onNavigate('login')} className="text-green-400 hover:text-green-300 font-medium">
                  Entrar
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PlayersScreen({ onNavigate }: { onNavigate: (screen: Screen, data?: Player) => void }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    position: '' as Position | '',
    skill: '' as SkillLevel | '',
    gameType: '' as GameType | '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [filters]);

  const fetchPlayers = async () => {
    setLoading(true);
    let query = supabase
      .from('players')
      .select('*, profiles(*)')
      .eq('is_available', true)
      .order('rating_avg', { ascending: false });

    if (filters.position) {
      query = query.eq('primary_position', filters.position);
    }
    if (filters.skill) {
      query = query.eq('skill_level', filters.skill);
    }

    const { data } = await query;
    let filteredData = data as unknown as Player[] || [];

    if (filters.city) {
      filteredData = filteredData.filter(p =>
        p.profiles.city.toLowerCase().includes(filters.city.toLowerCase()) ||
        p.profiles.neighborhood.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    if (filters.gameType) {
      filteredData = filteredData.filter(p => p.game_types.includes(filters.gameType as GameType));
    }
    if (search) {
      filteredData = filteredData.filter(p =>
        p.profiles.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setPlayers(filteredData);
    setLoading(false);
  };

  const clearFilters = () => {
    setFilters({ city: '', position: '', skill: '', gameType: '' });
    setSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Jogadores Disponíveis</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
        </div>

        {showFilters && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Cidade/Bairro</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={e => setFilters({ ...filters, city: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
                  placeholder="Qualquer"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Posição</label>
                <select
                  value={filters.position}
                  onChange={e => setFilters({ ...filters, position: e.target.value as Position | '' })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
                >
                  <option value="" className="bg-gray-800">Todas</option>
                  {Object.entries(POSITION_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-gray-800">{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nível</label>
                <select
                  value={filters.skill}
                  onChange={e => setFilters({ ...filters, skill: e.target.value as SkillLevel | '' })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
                >
                  <option value="" className="bg-gray-800">Todos</option>
                  {Object.entries(SKILL_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-gray-800">{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Tipo de Jogo</label>
                <select
                  value={filters.gameType}
                  onChange={e => setFilters({ ...filters, gameType: e.target.value as GameType | '' })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
                >
                  <option value="" className="bg-gray-800">Todos</option>
                  {Object.entries(GAME_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-gray-800">{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white">
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Player Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando jogadores...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum jogador encontrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {players.map(player => (
            <PlayerCard key={player.id} player={player} onClick={() => onNavigate('player-detail', player)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-green-500/30 transition-all text-left group">
      <div className="flex items-start gap-3">
        {player.profiles.photo_url ? (
          <img src={player.profiles.photo_url} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
            <span className="text-black text-xl font-bold">{player.profiles.name.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate group-hover:text-green-400 transition-colors">{player.profiles.name}</h3>
          <p className="text-green-400 text-sm">{POSITION_LABELS[player.primary_position]}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{player.profiles.neighborhood}, {player.profiles.city}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <span className="text-xs text-gray-400">{SKILL_LABELS[player.skill_level]}</span>
        {player.rating_avg > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-white font-medium">{player.rating_avg.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({player.rating_count})</span>
          </div>
        )}
      </div>
    </button>
  );
}

function PlayerDetailScreen({ player, onNavigate }: { player: Player; onNavigate: (screen: Screen, data?: Player) => void }) {
  const { user, profile } = useAuth();
  const [hasHired, setHasHired] = useState(false);
  const [hiredInfo, setHiredInfo] = useState<Hire | null>(null);

  useEffect(() => {
    if (user && profile && profile.user_type === 'organizer') {
      checkHireStatus();
    }
  }, [user, profile, player.id]);

  const checkHireStatus = async () => {
    const { data } = await supabase
      .from('hires')
      .select('*')
      .eq('player_id', player.id)
      .eq('organizer_id', profile!.id)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setHasHired(true);
      setHiredInfo(data as unknown as Hire);
    }
  };

  const handleWhatsApp = () => {
    if (hasHired && player.profiles.whatsapp) {
      const phone = player.profiles.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}?text=Olá! Somos do Fecha Time. Você foi contratado para uma partida.`, '_blank');
    }
  };

  const gameTypesLabels = player.game_types.map(gt => GAME_TYPE_LABELS[gt]).join(', ');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => onNavigate('players')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600/20 to-green-400/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {player.profiles.photo_url ? (
              <img src={player.profiles.photo_url} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-green-500" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center border-4 border-green-500">
                <span className="text-black text-3xl font-bold">{player.profiles.name.charAt(0)}</span>
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">{player.profiles.name}</h1>
              <p className="text-green-400 text-lg">{POSITION_LABELS[player.primary_position]}</p>
              {player.secondary_positions.length > 0 && (
                <p className="text-gray-400 text-sm mt-1">
                  Joga também: {player.secondary_positions.map(p => POSITION_LABELS[p]).join(', ')}
                </p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {player.profiles.neighborhood}, {player.profiles.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 sm:p-8 space-y-6">
          {player.rating_avg > 0 && (
            <div className="flex items-center justify-center gap-2 py-4 bg-white/5 rounded-xl">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              <span className="text-3xl font-bold text-white">{player.rating_avg.toFixed(1)}</span>
              <span className="text-gray-400">({player.rating_count} avaliações)</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <InfoCard icon={Trophy} label="Nível" value={SKILL_LABELS[player.skill_level]} />
            <InfoCard icon={Target} label="Tipos de Jogo" value={gameTypesLabels} />
            <InfoCard icon={DollarSign} label="Valor por Jogo" value={player.price_per_game ? `R$ ${player.price_per_game.toFixed(2)}` : 'A combinar'} />
            <InfoCard icon={Clock} label="Status" value={player.is_available ? 'Disponível' : 'Indisponível'} />
          </div>

          {/* Availability Schedule */}
          {player.availability && Object.keys(player.availability).length > 0 && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Horários Disponíveis
              </p>
              <div className="space-y-2">
                {DAYS_OF_WEEK.map(day => {
                  const slots = player.availability[day.key] || [];
                  if (slots.length === 0) return null;
                  return (
                    <div key={day.key} className="flex items-start gap-2">
                      <span className="text-gray-300 text-sm w-16">{day.label}:</span>
                      <div className="flex flex-wrap gap-1">
                        {slots.map(slot => (
                          <span key={slot} className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {user && profile ? (
            profile.user_type === 'organizer' ? (
              <div className="space-y-3">
                {hasHired ? (
                  <>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                      <p className="text-green-400 font-medium flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Contratação confirmada! Você pode entrar em contato.
                      </p>
                      {hiredInfo && (
                        <p className="text-gray-400 text-sm mt-2">
                          Data: {new Date(hiredInfo.game_date).toLocaleDateString('pt-BR')} às {hiredInfo.game_time}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleWhatsApp}
                      className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chamar no WhatsApp
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate('hire-player', player)}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    Contratar Jogador
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Organizadores precisam contratar para ver o WhatsApp
                </p>
              </div>
            )
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all"
            >
              Entre para contratar este jogador
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}

function CallUpsScreen({ user, profile, onNavigate }: { user: any; profile: Profile | null; onNavigate: (screen: Screen, data?: CallUp) => void }) {
  const [callUps, setCallUps] = useState<CallUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  useEffect(() => {
    fetchCallUps();
  }, [filter, profile]);

  const fetchCallUps = async () => {
    setLoading(true);
    let query = supabase
      .from('call_ups')
      .select('*, profiles!call_ups_organizer_id_fkey(*)')
      .order('game_date', { ascending: true });

    if (filter === 'mine' && profile) {
      query = query.eq('organizer_id', profile.id);
    } else {
      query = query.eq('status', 'open');
    }

    const { data } = await query;
    setCallUps(data as unknown as CallUp[] || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Convocações</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'mine')}
            className="flex-1 sm:flex-none bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:outline-none"
          >
            <option value="all" className="bg-gray-800">Todas abertas</option>
            <option value="mine" className="bg-gray-800">Minhas convocações</option>
          </select>
          {user && (
            <button
              onClick={() => onNavigate('create-call-up')}
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      ) : callUps.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma convocação encontrada</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {callUps.map(callUp => (
            <CallUpCard key={callUp.id} callUp={callUp} onClick={() => onNavigate('call-up-detail', callUp)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CallUpCard({ callUp, onClick }: { callUp: CallUp; onClick: () => void }) {
  const positionsLabels = callUp.positions_needed.map(p => POSITION_LABELS[p as Position]).join(', ');
  const gameDate = new Date(callUp.game_date + 'T' + callUp.game_time);

  return (
    <button onClick={onClick} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-green-500/30 transition-all text-left group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">{callUp.title}</h3>
          <p className="text-green-400 text-sm">{GAME_TYPE_LABELS[callUp.game_type]}</p>
        </div>
        {callUp.payment_amount && (
          <div className="text-right">
            <span className="bg-green-500/20 text-green-400 text-sm font-medium px-2 py-1 rounded">
              R$ {callUp.payment_amount.toFixed(0)}
            </span>
            {callUp.net_amount && (
              <p className="text-xs text-gray-500 mt-1">Líquido: R$ {callUp.net_amount.toFixed(2)}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{gameDate.toLocaleDateString('pt-BR')} às {callUp.game_time.slice(0, 5)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{callUp.neighborhood}, {callUp.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span className="truncate">{positionsLabels}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <span className="text-xs text-gray-500">por {callUp.profiles?.name || 'Organizador'}</span>
        <span className={`text-xs px-2 py-1 rounded ${callUp.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {callUp.status === 'open' ? 'Aberta' : callUp.status === 'closed' ? 'Fechada' : 'Cancelada'}
        </span>
      </div>
    </button>
  );
}

function CallUpDetailScreen({ callUp, user, profile, onNavigate }: { callUp: CallUp; user: any; profile: Profile | null; onNavigate: (screen: Screen) => void }) {
  const [applications, setApplications] = useState<CallUpApplication[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [callUp.id, profile]);

  const fetchData = async () => {
    const [appsRes, myAppRes] = await Promise.all([
      supabase
        .from('call_up_applications')
        .select('*, profiles(*), players(*)')
        .eq('call_up_id', callUp.id),
      profile && profile.user_type === 'player'
        ? supabase
            .from('call_up_applications')
            .select('id')
            .eq('call_up_id', callUp.id)
            .eq('player_id', profile.id)
            .maybeSingle()
        : { data: null }
    ]);
    setApplications(appsRes.data as unknown as CallUpApplication[] || []);
    setHasApplied(!!myAppRes.data);
    setLoading(false);
  };

  const handleApply = async () => {
    if (!user || !profile || profile.user_type !== 'player') return;
    await supabase.from('call_up_applications').insert({
      call_up_id: callUp.id,
      player_id: profile.id,
    });
    fetchData();
  };

  const handleUpdateApplication = async (appId: string, status: 'accepted' | 'rejected') => {
    await supabase.from('call_up_applications').update({ status }).eq('id', appId);
    fetchData();
  };

  const gameDate = new Date(callUp.game_date + 'T' + callUp.game_time);
  const positionsLabels = callUp.positions_needed.map(p => POSITION_LABELS[p as Position]).join(', ');
  const isOrganizer = profile?.id === callUp.organizer_id;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => onNavigate('call-ups')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600/20 to-green-400/10 p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium mb-1">{GAME_TYPE_LABELS[callUp.game_type]}</p>
              <h1 className="text-2xl font-bold text-white">{callUp.title}</h1>
              <p className="text-gray-400 mt-1">por {callUp.profiles?.name || 'Organizador'}</p>
            </div>
            {callUp.payment_amount && (
              <div className="text-right">
                <p className="text-green-400 text-2xl font-bold">R$ {callUp.payment_amount.toFixed(0)}</p>
                <p className="text-gray-400 text-sm">por jogador</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Data e Hora
              </div>
              <p className="text-white font-medium">{gameDate.toLocaleDateString('pt-BR')} às {callUp.game_time.slice(0, 5)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                Local
              </div>
              <p className="text-white font-medium">{callUp.location_name}</p>
              <p className="text-gray-400 text-sm">{callUp.address}</p>
              <p className="text-gray-400 text-sm">{callUp.neighborhood}, {callUp.city}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Target className="w-4 h-4" />
                Posições
              </div>
              <p className="text-white font-medium">{positionsLabels}</p>
              <p className="text-gray-400 text-sm">{callUp.players_needed} jogador(es) necessário</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Trophy className="w-4 h-4" />
                Nível Desejado
              </div>
              <p className="text-white font-medium">{callUp.skill_level === 'any' ? 'Qualquer nível' : SKILL_LABELS[callUp.skill_level as SkillLevel]}</p>
            </div>
          </div>

          {callUp.payment_amount && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-2">Pagamento</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valor bruto:</span>
                  <span className="text-white">R$ {callUp.payment_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taxa Fecha Time (10%):</span>
                  <span className="text-yellow-400">- R$ {((callUp.payment_amount * (callUp.platform_fee_percent || 10)) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-green-500/20">
                  <span className="text-green-400 font-medium">Você recebe:</span>
                  <span className="text-green-400 font-bold text-lg">R$ {(callUp.net_amount || callUp.payment_amount * 0.9).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {callUp.notes && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Observações</p>
              <p className="text-white">{callUp.notes}</p>
            </div>
          )}

          {/* Apply Button */}
          {user && profile && profile.user_type === 'player' && !isOrganizer && callUp.status === 'open' && (
            hasApplied ? (
              <div className="flex items-center justify-center gap-2 py-4 bg-green-500/10 rounded-xl text-green-400">
                <Check className="w-5 h-5" />
                Inscrição enviada
              </div>
            ) : (
              <button
                onClick={handleApply}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Inscrever-se
              </button>
            )
          )}

          {!user && (
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Entre para se inscrever
            </button>
          )}

          {/* Applications (for organizer) */}
          {isOrganizer && applications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Inscrições ({applications.length})</h2>
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-black font-bold">{app.profiles.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{app.profiles.name}</p>
                        <p className="text-gray-400 text-sm">{POSITION_LABELS[app.players.primary_position]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateApplication(app.id, 'accepted')}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateApplication(app.id, 'rejected')}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <span className={`text-sm px-2 py-1 rounded ${app.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {app.status === 'accepted' ? 'Aceito' : 'Recusado'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateCallUpScreen({ profile, onNavigate }: { profile: Profile; onNavigate: (screen: Screen) => void }) {
  const [title, setTitle] = useState('');
  const [gameDate, setGameDate] = useState('');
  const [gameTime, setGameTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(profile.city);
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood);
  const [gameType, setGameType] = useState<GameType>('society');
  const [positionsNeeded, setPositionsNeeded] = useState<Position[]>([]);
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | 'any'>('any');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const togglePosition = (pos: Position) => {
    setPositionsNeeded(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (positionsNeeded.length === 0) {
      setError('Selecione pelo menos uma posição');
      return;
    }
    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from('call_ups').insert({
      organizer_id: profile.id,
      title,
      game_date: gameDate,
      game_time: gameTime,
      location_name: locationName,
      address,
      city,
      neighborhood,
      game_type: gameType,
      positions_needed: positionsNeeded,
      players_needed: playersNeeded,
      skill_level: skillLevel,
      payment_amount: paymentAmount ? parseFloat(paymentAmount) : null,
      notes: notes || null,
      status: 'open',
    });

    setLoading(false);
    if (insertError) {
      setError('Erro ao criar convocação');
    } else {
      onNavigate('call-ups');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => onNavigate('call-ups')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Nova Convocação</h1>
        <p className="text-gray-400 mb-6">Crie uma vaga e encontre jogadores para sua pelada</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Título da Convocação *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              placeholder="Ex: Preciso de goleiro para sábado"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Data *</label>
              <input
                type="date"
                value={gameDate}
                onChange={e => setGameDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Horário *</label>
              <input
                type="time"
                value={gameTime}
                onChange={e => setGameTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nome do Local *</label>
            <input
              type="text"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              placeholder="Ex: Quadra do Parque XYZ"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Endereço *</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              placeholder="Rua, número..."
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Cidade *</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Bairro *</label>
              <input
                type="text"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Tipo de Jogo *</label>
              <select
                value={gameType}
                onChange={e => setGameType(e.target.value as GameType)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
              >
                {Object.entries(GAME_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-gray-800">{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nível Desejado</label>
              <select
                value={skillLevel}
                onChange={e => setSkillLevel(e.target.value as SkillLevel | 'any')}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
              >
                <option value="any" className="bg-gray-800">Qualquer nível</option>
                {Object.entries(SKILL_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-gray-800">{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Jogadores Necessários</label>
              <input
                type="number"
                value={playersNeeded}
                onChange={e => setPlayersNeeded(parseInt(e.target.value) || 1)}
                min={1}
                max={20}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Posições Necessárias *</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(POSITION_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => togglePosition(value as Position)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${positionsNeeded.includes(value as Position) ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Valor por Jogador</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                min={0}
                step="0.01"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                placeholder="0,00"
              />
            </div>
            {paymentAmount && parseFloat(paymentAmount) > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valor bruto:</span>
                  <span className="text-white">R$ {parseFloat(paymentAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taxa Fecha Time (10%):</span>
                  <span className="text-yellow-400">- R$ {(parseFloat(paymentAmount) * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-green-500/20">
                  <span className="text-green-400 font-medium">Jogador recebe:</span>
                  <span className="text-green-400 font-semibold">R$ {(parseFloat(paymentAmount) * 0.9).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none"
              placeholder="Informações adicionais..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !title || !gameDate || !gameTime || !locationName || !address || !city || !neighborhood}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold py-4 rounded-xl transition-colors"
          >
            {loading ? 'Criando...' : 'Criar Convocação'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfileScreen({ profile, onNavigate }: { profile: Profile; onNavigate: (screen: Screen) => void }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.photo_url);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (profile.user_type === 'player') {
      supabase.from('players').select('*').eq('id', profile.id).maybeSingle().then(({ data, error: queryError }) => {
        if (queryError) {
          setError('Erro ao carregar dados do jogador');
          console.error('Player query error:', queryError);
        } else if (data) {
          setPlayer({ ...data, profiles: profile } as unknown as Player);
        } else {
          setError('Dados do jogador nao encontrados');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('Erro ao fazer upload da foto');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    await supabase.from('profiles').update({ photo_url: publicUrl }).eq('id', profile.id);
    setPhotoUrl(publicUrl);
    setUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        {/* Photo Upload Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-green-500" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center border-4 border-green-500">
                <span className="text-black text-3xl font-bold">{profile.name.charAt(0)}</span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-400 text-black p-2 rounded-full cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {uploading && <p className="text-gray-400 text-sm mt-2">Enviando foto...</p>}
        </div>

        <div className="flex items-start justify-between mb-6">
          <div className="text-center w-full">
            <span className="text-green-400 text-sm font-medium">{profile.user_type === 'player' ? 'Jogador' : 'Organizador'}</span>
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
          </div>
        </div>

        <div className="space-y-4 text-gray-300">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-green-400" />
            <span>{profile.neighborhood}, {profile.city}</span>
          </div>
          {profile.whatsapp && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-400" />
              <span>{profile.whatsapp}</span>
            </div>
          )}
        </div>

        {loading && profile.user_type === 'player' && (
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg p-3">
              {error}
            </div>
          </div>
        )}

        {player && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Posição Principal</p>
                <p className="text-white font-medium">{POSITION_LABELS[player.primary_position]}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Nível</p>
                <p className="text-white font-medium">{SKILL_LABELS[player.skill_level]}</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Tipos de Jogo</p>
              <p className="text-white font-medium">{player.game_types.map(gt => GAME_TYPE_LABELS[gt]).join(', ')}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Valor por Partida</p>
              <p className="text-white font-medium">{player.price_per_game ? `R$ ${player.price_per_game.toFixed(2)}` : 'A combinar'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Status</p>
              <p className={`font-medium ${player.is_available ? 'text-green-400' : 'text-red-400'}`}>
                {player.is_available ? 'Disponível' : 'Indisponível'}
              </p>
            </div>
            {player.availability && Object.keys(player.availability).length > 0 && (
              <div className="bg-white/5 rounded-lg p-3 sm:col-span-2">
                <p className="text-gray-400 text-sm mb-2">Horários Disponíveis</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DAYS_OF_WEEK.map(day => {
                    const slots = player.availability[day.key] || [];
                    if (slots.length === 0) return null;
                    return (
                      <div key={day.key} className="text-xs">
                        <span className="text-gray-300">{day.label}:</span>{' '}
                        <span className="text-green-400">{slots.map(s => s.split('-')[0]).join(', ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {player.rating_avg > 0 && (
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{player.rating_avg.toFixed(1)}</span>
                <span className="text-gray-400">({player.rating_count} avaliações)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MyApplicationsScreen({ profile, onNavigate }: { profile: Profile; onNavigate: (screen: Screen, data?: CallUp) => void }) {
  const [applications, setApplications] = useState<(CallUpApplication & { call_ups: CallUp })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const { data } = await supabase
        .from('call_up_applications')
        .select('*, call_ups(*, profiles!call_ups_organizer_id_fkey(*))')
        .eq('player_id', profile.id)
        .order('created_at', { ascending: false });
      setApplications(data as unknown as (CallUpApplication & { call_ups: CallUp })[] || []);
      setLoading(false);
    };
    fetchApps();
  }, [profile.id]);

  return (
    <div className="space-y-6">
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-white">Minhas Inscrições</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Send className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Você ainda não se inscreveu em nenhuma convocação</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold">{app.call_ups.title}</h3>
                  <p className="text-gray-400 text-sm">{new Date(app.call_ups.game_date).toLocaleDateString('pt-BR')} - {app.call_ups.neighborhood}</p>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : app.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {app.status === 'pending' ? 'Pendente' : app.status === 'accepted' ? 'Aceito' : 'Recusado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HirePlayerScreen({ player, profile, onNavigate }: { player: Player; profile: Profile; onNavigate: (screen: Screen) => void }) {
  const [gameDate, setGameDate] = useState('');
  const [gameTime, setGameTime] = useState('');
  const [location, setLocation] = useState('');
  const [grossAmount, setGrossAmount] = useState(player.price_per_game?.toString() || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platformFee = grossAmount ? parseFloat(grossAmount) * 0.1 : 0;
  const netAmount = grossAmount ? parseFloat(grossAmount) * 0.9 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grossAmount || parseFloat(grossAmount) <= 0) {
      setError('Defina o valor da contratação');
      return;
    }
    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from('hires').insert({
      player_id: player.id,
      organizer_id: profile.id,
      game_date: gameDate,
      game_time: gameTime,
      location,
      gross_amount: parseFloat(grossAmount),
      platform_fee: platformFee,
      net_amount: netAmount,
      notes: notes || null,
      status: 'pending',
      payment_status: 'pending',
    });

    setLoading(false);
    if (insertError) {
      setError('Erro ao criar contratação. Tente novamente.');
    } else {
      alert('Contratação criada! Em breve você poderá pagar para ver o contato do jogador.');
      onNavigate('my-hires');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => onNavigate('player-detail')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          {player.profiles.photo_url ? (
            <img src={player.profiles.photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <span className="text-black text-xl font-bold">{player.profiles.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{player.profiles.name}</h1>
            <p className="text-green-400">{POSITION_LABELS[player.primary_position]}</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white mb-4">Nova Contratação</h2>

        {!user && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-sm">
              Para completar a contratação e ver o WhatsApp do jogador, você precisará efetuar o pagamento.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Data do Jogo *</label>
              <input
                type="date"
                value={gameDate}
                onChange={e => setGameDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Horário *</label>
              <input
                type="time"
                value={gameTime}
                onChange={e => setGameTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Local *</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              placeholder="Nome do local ou endereço"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Valor da Contratação (R$) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
              <input
                type="number"
                value={grossAmount}
                onChange={e => setGrossAmount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {grossAmount && parseFloat(grossAmount) > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valor Total:</span>
                <span className="text-white">R$ {parseFloat(grossAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxa Fecha Time (10%):</span>
                <span className="text-yellow-400">- R$ {(platformFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-green-500/20">
                <span className="text-green-400 font-medium">Jogador recebe:</span>
                <span className="text-green-400 font-bold">R$ {netAmount.toFixed(2)}</span>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                * O contato do jogador será liberado após confirmação do pagamento
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none"
              placeholder="Informações adicionais..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !gameDate || !gameTime || !location || !grossAmount}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold py-4 rounded-xl transition-colors"
          >
            {loading ? 'Criando...' : 'Criar Contratação'}
          </button>
        </form>
      </div>
    </div>
  );
}

function MyHiresScreen({ profile, onNavigate }: { profile: Profile; onNavigate: (screen: Screen) => void }) {
  const [hires, setHires] = useState<(Hire & { profiles: Profile; players: Player & { profiles: Profile } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'received'>('all');

  useEffect(() => {
    fetchHires();
  }, [profile.id, filter]);

  const fetchHires = async () => {
    setLoading(true);
    let query = supabase
      .from('hires')
      .select('*, profiles(*), players(*, profiles(*))')
      .order('created_at', { ascending: false });

    if (filter === 'received' && profile.user_type === 'player') {
      query = query.eq('player_id', profile.id);
    } else if (profile.user_type === 'organizer') {
      query = query.eq('organizer_id', profile.id);
    }

    const { data } = await query;
    setHires(data as unknown as (Hire & { profiles: Profile; players: Player & { profiles: Profile } })[] || []);
    setLoading(false);
  };

  const handleWhatsApp = (hire: Hire) => {
    const player = hire.players as Player & { profiles: Profile };
    if (player.profiles?.whatsapp && hire.payment_status === 'paid') {
      const phone = player.profiles.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  };

  const handlePay = (hire: Hire) => {
    alert('Para receber os pagamentos, primeiro configure o Stripe. Acesse https://bolt.new/setup/stripe');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {profile.user_type === 'organizer' ? 'Minhas Contratações' : 'Propostas Recebidas'}
        </h1>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as 'all' | 'received')}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
        >
          {profile.user_type === 'organizer' ? (
            <>
              <option value="all" className="bg-gray-800">Todas</option>
            </>
          ) : (
            <>
              <option value="received" className="bg-gray-800">Recebidas</option>
            </>
          )}
        </select>
      </div>

      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : hires.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma contratação encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hires.map(hire => {
            const player = hire.players as Player & { profiles: Profile };
            return (
              <div key={hire.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {player.profiles?.photo_url ? (
                      <img src={player.profiles.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-black font-bold">{player.profiles?.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold">{player.profiles?.name || 'Jogador'}</p>
                      <p className="text-gray-400 text-sm">{new Date(hire.game_date).toLocaleDateString('pt-BR')} às {hire.game_time}</p>
                      <p className="text-gray-400 text-sm">{hire.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${hire.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : hire.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {hire.status === 'pending' ? 'Pendente' : hire.status === 'completed' ? 'Concluída' : hire.status}
                    </span>
                    {hire.payment_status === 'paid' && (
                      <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">Pago</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400">Valor: </span>
                    <span className="text-white">R$ {hire.gross_amount.toFixed(2)}</span>
                    <span className="text-gray-500 text-xs ml-2">(Jogador: R$ {hire.net_amount.toFixed(2)})</span>
                  </div>

                  {profile.user_type === 'organizer' && hire.payment_status !== 'paid' && (
                    <button
                      onClick={() => handlePay(hire)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Pagar R$ {hire.gross_amount.toFixed(2)}
                    </button>
                  )}

                  {hire.payment_status === 'paid' && (
                    <button
                      onClick={() => handleWhatsApp(hire)}
                      className="bg-green-500 hover:bg-green-400 text-black text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
