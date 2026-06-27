import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminGoals() {
  return (
    <SimpleCrudPage
      title="Objectifs Relationnels"
      endpoint="admin/goals"
      fields={[
        { key: 'title',    label: 'Titre',    type: 'text' },
        { key: 'subtitle', label: 'Sous-titre', type: 'text', required: false },
        { key: 'status',   label: 'Statut',   type: 'select-status' },
      ]}
    />
  );
}
