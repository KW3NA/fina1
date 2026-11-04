import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../components/ThemeContext';

/**
 * Admin Dashboard — citizen app entry point for admin tooling.
 * Tabs: Overview | Reports | Manage Users
 * All data is read live from Supabase (users, courses, enrollments,
 * quiz_attempts, hubs, province_metrics).
 */

type Tab = 'overview' | 'reports' | 'users';

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

const AdminDashboard = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // raw data
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);

  // users tab state
  const [search, setSearch] = useState('');
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, c, e, a, h, m] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*'),
        supabase.from('enrollments').select('*'),
        supabase.from('quiz_attempts').select('*').order('created_at', { ascending: false }),
        supabase.from('hubs').select('*'),
        supabase.from('province_metrics').select('*'),
      ]);
      const firstErr = [u, c, e, a, h, m].find((r) => r.error);
      if (firstErr?.error) throw new Error(firstErr.error.message);
      setUsers(u.data || []);
      setCourses(c.data || []);
      setEnrollments(e.data || []);
      setAttempts(a.data || []);
      setHubs(h.data || []);
      setMetrics(m.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // ---------- derived stats ----------
  const learners = users.filter((x) => x.role === 'learner');
  const practitioners = users.filter((x) => x.role === 'practitioner');
  const admins = users.filter((x) => x.role === 'admin' || x.role === 'superadmin');
  const pending = users.filter((x) => x.status === 'pending');
  const publishedCourses = courses.filter((x) => x.is_published !== false);
  const completedEnrollments = enrollments.filter((x) => x.completed);
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, x) => s + (x.progress || 0), 0) / enrollments.length)
      : 0;
  const passedAttempts = attempts.filter((x) => x.passed);
  const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((s, x) => s + (x.score || 0), 0) / attempts.length) : 0;

  const byLevel = ['Beginner', 'Intermediate', 'Advanced'].map((lvl) => ({
    label: lvl,
    count: learners.filter((l) => (l.current_level || 'Beginner') === lvl).length,
  }));

  const byCompetency = ['using_devices', 'getting_online', 'finding_judging_info', 'staying_safe', 'doing_things_online'].map(
    (area) => ({
      label: area.replace(/_/g, ' '),
      count: publishedCourses.filter((c) => c.competency_area === area).length,
    }),
  );

  const topCourses = publishedCourses
    .map((c) => ({
      ...c,
      enrolled: enrollments.filter((e) => e.course_id === c.id).length,
      completions: enrollments.filter((e) => e.course_id === c.id && e.completed).length,
    }))
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, 5);

  const courseName = (id: string) => courses.find((c) => c.id === id)?.title || 'Unknown course';

  const filteredUsers = users.filter((x) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (x.name || '').toLowerCase().includes(q) ||
      (x.email || '').toLowerCase().includes(q) ||
      (x.role || '').toLowerCase().includes(q) ||
      (x.province || '').toLowerCase().includes(q)
    );
  });

  // ---------- user actions ----------
  const confirmAction = (title: string, message: string, onConfirm: () => void) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: onConfirm },
    ]);

  const updateUser = async (id: string, patch: any) => {
    setBusyUserId(id);
    const { error: upErr } = await supabase.from('users').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    setBusyUserId(null);
    if (upErr) {
      Alert.alert('Error', `Could not update user: ${upErr.message}`);
      return false;
    }
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    return true;
  };

  const handleStatusChange = (userRow: any, status: string) =>
    confirmAction(
      `Set status to "${status}"?`,
      `${userRow.name} (${userRow.email}) will be marked as ${status}.`,
      () => updateUser(userRow.id, { status }),
    );

  const handleRoleChange = (userRow: any, role: string) =>
    confirmAction(`Change role to "${role}"?`, `${userRow.name} will become a ${role}.`, () =>
      updateUser(userRow.id, { role }),
    );

  const handleToggleDisabled = (userRow: any) => {
    const next = !userRow.is_disabled;
    confirmAction(
      next ? 'Disable user?' : 'Re-enable user?',
      `${userRow.name} will ${next ? 'no longer be able to sign in.' : 'be able to sign in again.'}`,
      () => updateUser(userRow.id, { is_disabled: next, status: next ? 'disabled' : 'active' }),
    );
  };

  const handleDelete = (userRow: any) =>
    confirmAction('Delete user permanently?', `${userRow.name} (${userRow.email}) and their enrollments will be removed. This cannot be undone.`, async () => {
      setBusyUserId(userRow.id);
      await supabase.from('enrollments').delete().eq('user_id', userRow.id);
      const { error: delErr } = await supabase.from('users').delete().eq('id', userRow.id);
      setBusyUserId(null);
      if (delErr) {
        Alert.alert('Error', `Could not delete user: ${delErr.message}`);
        return;
      }
      setUsers((prev) => prev.filter((x) => x.id !== userRow.id));
    });

  // ---------- styles helpers ----------
  const cardBg = isDark ? '#1e1e1e' : '#ffffff';
  const subText = colors.textSecondary ?? '#666';

  const StatCard = ({ icon, value, label, tint }: any) => (
    <View style={[styles.statCard, { backgroundColor: cardBg, shadowOpacity: isDark ? 0 : 0.08 }]}>
      <Ionicons name={icon} size={20} color={tint || '#2563eb'} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: subText }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  const Bar = ({ label, count, max, tint }: any) => (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.barRow}>
        <Text style={[styles.barLabel, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.barCount, { color: subText }]}>{count}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: isDark ? '#2a2a2a' : '#eee' }]}>
        <View
          style={{
            height: 8,
            borderRadius: 4,
            width: `${max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0}%`,
            backgroundColor: tint || '#2563eb',
          }}
        />
      </View>
    </View>
  );

  const SectionTitle = ({ children }: any) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>
  );

  const renderChip = (label: string, active: boolean, onPress: () => void, tint?: string) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: active ? tint || '#2563eb' : isDark ? '#444' : '#ddd' },
        active && { backgroundColor: tint || '#2563eb' },
      ]}
    >
      <Text style={{ color: active ? '#fff' : colors.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );

  // ---------- OVERVIEW ----------
  const renderOverview = () => (
    <>
      <View style={styles.statsGrid}>
        <StatCard icon="people" value={learners.length} label="Learners" tint="#2563eb" />
        <StatCard icon="briefcase" value={practitioners.length} label="Practitioners" tint="#7c3aed" />
        <StatCard icon="school" value={publishedCourses.length} label="Published courses" tint="#059669" />
        <StatCard icon="ribbon" value={enrollments.length} label="Enrollments" tint="#d97706" />
        <StatCard icon="checkmark-done" value={completedEnrollments.length} label="Completions" tint="#0891b2" />
        <StatCard icon="hourglass" value={pending.length} label="Pending approvals" tint="#dc2626" />
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <SectionTitle>Learner levels</SectionTitle>
        {byLevel.map((b) => (
          <Bar key={b.label} label={b.label} count={b.count} max={Math.max(...byLevel.map((x) => x.count), 1)} tint="#2563eb" />
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <SectionTitle>Courses by competency area</SectionTitle>
        {byCompetency.map((b) => (
          <Bar key={b.label} label={b.label} count={b.count} max={Math.max(...byCompetency.map((x) => x.count), 1)} tint="#059669" />
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <SectionTitle>Most enrolled courses</SectionTitle>
        {topCourses.length === 0 ? (
          <Text style={{ color: subText }}>No published courses yet.</Text>
        ) : (
          topCourses.map((c) => (
            <View key={c.id} style={[styles.listRow, { borderBottomColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
                  {c.title}
                </Text>
                <Text style={{ color: subText, fontSize: 12 }}>
                  {c.level} · {c.enrolled} enrolled · {c.completions} completed
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={subText} />
            </View>
          ))
        )}
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <SectionTitle>Network</SectionTitle>
        <Text style={{ color: subText, lineHeight: 20 }}>
          {hubs.length} digital literacy hubs · {metrics.length} provinces reporting ·{' '}
          {admins.length} admin{admins.length === 1 ? '' : 's'}
        </Text>
      </View>
    </>
  );

  // ---------- REPORTS ----------
  const renderReports = () => {
    const completionRate = pct(completedEnrollments.length, enrollments.length);
    const passRate = pct(passedAttempts.length, attempts.length);
    const activeUsers = users.filter((x) => x.status === 'active' && !x.is_disabled).length;
    const disabledUsers = users.filter((x) => x.is_disabled).length;

    const levelRows = ['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
      const inLevel = learners.filter((l) => (l.current_level || 'Beginner') === lvl);
      const ids = new Set(inLevel.map((l) => l.id));
      const enr = enrollments.filter((e) => ids.has(e.user_id));
      const comp = enr.filter((e) => e.completed).length;
      return { lvl, learners: inLevel.length, enrollments: enr.length, completions: comp };
    });

    return (
      <>
        <View style={styles.statsGrid}>
          <StatCard icon="trending-up" value={`${avgProgress}%`} label="Avg course progress" tint="#2563eb" />
          <StatCard icon="checkmark-circle" value={`${completionRate}%`} label="Completion rate" tint="#059669" />
          <StatCard icon="analytics" value={`${attempts.length}`} label="Quiz attempts" tint="#7c3aed" />
          <StatCard icon="trophy" value={`${avgScore}%`} label="Avg quiz score" tint="#d97706" />
          <StatCard icon="shield-checkmark" value={`${passRate}%`} label="Quiz pass rate" tint="#0891b2" />
          <StatCard icon="person" value={`${activeUsers}`} label="Active users" tint="#16a34a" />
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SectionTitle>Enrollment & completion by level</SectionTitle>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadTxt, { flex: 1.2, color: subText }]}>Level</Text>
            <Text style={[styles.tableHeadTxt, { flex: 1, color: subText }]}>Learners</Text>
            <Text style={[styles.tableHeadTxt, { flex: 1, color: subText }]}>Enrolled</Text>
            <Text style={[styles.tableHeadTxt, { flex: 1, color: subText }]}>Done</Text>
          </View>
          {levelRows.map((r) => (
            <View key={r.lvl} style={[styles.tableRow, { borderTopColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
              <Text style={{ flex: 1.2, color: colors.text, fontWeight: '600' }}>{r.lvl}</Text>
              <Text style={{ flex: 1, color: colors.text }}>{r.learners}</Text>
              <Text style={{ flex: 1, color: colors.text }}>{r.enrollments}</Text>
              <Text style={{ flex: 1, color: r.completions > 0 ? '#059669' : subText }}>{r.completions}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SectionTitle>Provinces (from hub metrics)</SectionTitle>
          {metrics.length === 0 ? (
            <Text style={{ color: subText }}>No province metrics recorded yet.</Text>
          ) : (
            [...metrics]
              .sort((a, b) => (b.learner_count || 0) - (a.learner_count || 0))
              .map((p) => (
                <Bar
                  key={p.id}
                  label={`${p.province_name} · ${p.hub_count || 0} hubs`}
                  count={p.learner_count || 0}
                  max={Math.max(...metrics.map((x) => x.learner_count || 0), 1)}
                  tint="#7c3aed"
                />
              ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SectionTitle>Recent quiz attempts</SectionTitle>
          {attempts.length === 0 ? (
            <View style={{ paddingVertical: 8 }}>
              <Ionicons name="videocam-outline" size={22} color={subText} />
              <Text style={{ color: subText, marginTop: 6 }}>
                No quiz attempts recorded yet. Attempts are saved automatically once learners finish proctored quizzes and assessments.
              </Text>
            </View>
          ) : (
            attempts.slice(0, 8).map((a) => (
              <View key={a.id} style={[styles.listRow, { borderBottomColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
                    {courseName(a.course_id)}
                  </Text>
                  <Text style={{ color: subText, fontSize: 12 }}>
                    Score {a.score}% · {fmtDate(a.created_at)}
                  </Text>
                </View>
                <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: a.passed ? '#dcfce7' : '#fee2e2' }}>
                  <Text style={{ color: a.passed ? '#166534' : '#991b1b', fontSize: 11, fontWeight: '700' }}>
                    {a.passed ? 'PASSED' : 'FAILED'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SectionTitle>User status breakdown</SectionTitle>
          {['active', 'approved', 'pending', 'denied', 'disabled'].map((st) => (
            <Bar
              key={st}
              label={st[0].toUpperCase() + st.slice(1)}
              count={users.filter((x) => x.status === st).length}
              max={users.length || 1}
              tint={st === 'pending' ? '#d97706' : st === 'disabled' || st === 'denied' ? '#dc2626' : '#059669'}
            />
          ))}
          {disabledUsers > 0 ? null : null}
        </View>
      </>
    );
  };

  // ---------- MANAGE USERS ----------
  const renderUsers = () => (
    <>
      <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: isDark ? '#333' : '#e0e0e0' }]}>
        <Ionicons name="search" size={18} color={subText} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, email, role, province…"
          placeholderTextColor={subText}
          style={[styles.searchInput, { color: colors.text }]}
          autoCapitalize="none"
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={subText} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={{ color: subText, marginBottom: 8 }}>
        {filteredUsers.length} of {users.length} users
      </Text>

      {filteredUsers.map((row) => {
        const busy = busyUserId === row.id;
        return (
          <View key={row.id} style={[styles.userCard, { backgroundColor: cardBg }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.avatar, { backgroundColor: isDark ? '#2a2a2a' : '#eef2ff' }]}>
                <Text style={{ color: '#2563eb', fontWeight: '700' }}>
                  {(row.name || '?').trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                  {row.name}
                </Text>
                <Text style={{ color: subText, fontSize: 12 }} numberOfLines={1}>
                  {row.email}
                </Text>
                <Text style={{ color: subText, fontSize: 12 }}>
                  {row.role} · {row.province || '—'} · joined {fmtDate(row.created_at)}
                </Text>
              </View>
              {busy ? <ActivityIndicator size="small" color="#2563eb" /> : null}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: subText, fontSize: 11, marginRight: 6 }}>Status:</Text>
              {['active', 'pending', 'approved', 'denied'].map((st) =>
                renderChip(st, row.status === st, () => handleStatusChange(row, st), st === 'pending' ? '#d97706' : st === 'denied' ? '#dc2626' : '#059669'),
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Text style={{ color: subText, fontSize: 11, marginRight: 6 }}>Role:</Text>
              {['learner', 'practitioner', 'admin'].map((r) =>
                renderChip(r, row.role === r, () => handleRoleChange(row, r), r === 'admin' ? '#7c3aed' : r === 'practitioner' ? '#0891b2' : '#2563eb'),
              )}
            </View>

            <View style={[styles.userActions, { borderTopColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={{ color: subText, fontSize: 12, marginRight: 6 }}>
                  {row.is_disabled ? 'Disabled' : 'Enabled'}
                </Text>
                <Switch
                  value={!row.is_disabled}
                  onValueChange={() => handleToggleDisabled(row)}
                  disabled={busy}
                  trackColor={{ false: '#ccc', true: '#059669' }}
                />
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('WebView Screen', { uri: `https://app.supabase.com`, title: 'User record' })}
                style={{ display: 'none' }}
              >
                <Text />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(row)} disabled={busy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>Delete</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {filteredUsers.length === 0 && !loading ? (
        <View style={{ paddingVertical: 30, alignItems: 'center' }}>
          <Ionicons name="people-outline" size={32} color={subText} />
          <Text style={{ color: subText, marginTop: 8 }}>No users match your search.</Text>
        </View>
      ) : null}
    </>
  );

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'reports', label: 'Reports', icon: 'bar-chart' },
    { id: 'users', label: 'Manage Users', icon: 'people' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111' : '#f6f7fb' }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#111' : '#f6f7fb', borderBottomColor: isDark ? '#222' : '#e5e7eb' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', flex: 1, marginLeft: 10 }} numberOfLines={1}>
          Admin Dashboard
        </Text>
        <TouchableOpacity onPress={loadData} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={loading ? 'refresh' : 'refresh-outline'} size={22} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 10 }}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[
              {
                flex: 1,
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 10,
                marginHorizontal: 3,
                backgroundColor: tab === t.id ? '#2563eb' : cardBg,
              },
            ]}
          >
            <Ionicons name={t.icon as any} size={16} color={tab === t.id ? '#fff' : colors.text} />
            <Text style={{ fontSize: 11, marginTop: 2, color: tab === t.id ? '#fff' : colors.text, fontWeight: '600' }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <View style={{ margin: 12, padding: 12, borderRadius: 10, backgroundColor: '#fee2e2' }}>
          <Text style={{ color: '#991b1b', fontWeight: '600' }}>⚠️ {error}</Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={{ color: '#2563eb', marginTop: 4, fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading && users.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ color: subText, marginTop: 8 }}>Loading dashboard…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
          {tab === 'overview' ? renderOverview() : tab === 'reports' ? renderReports() : renderUsers()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 11, marginTop: 2 },
  card: { borderRadius: 14, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  barRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 12, fontWeight: '600', flex: 1, marginRight: 8 },
  barCount: { fontSize: 12, fontWeight: '700' },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  tableHead: { flexDirection: 'row', paddingBottom: 6 },
  tableHeadTxt: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 14 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  userCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default AdminDashboard;
