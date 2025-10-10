import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Configure your account preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
