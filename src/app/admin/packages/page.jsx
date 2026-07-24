import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminPackages() {
  return (
    <SimpleCrudPage
      title="Packages de coins"
      endpoint="admin/packages"
      canEdit={true}
      fields={[
        { key: 'coin',   label: 'Coins',     type: 'number' },
        { key: 'amt',    label: 'Prix (€)',  type: 'number' },
        { key: 'status', label: 'Statut',    type: 'select-status' },
      ]}
    />
  );
}
