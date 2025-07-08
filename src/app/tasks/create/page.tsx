"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCategory, TaskPriority, TaskStatus } from '@/types';
import { api } from '@/lib/api';

export default function CreateTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [assigneeId, setAssigneeId] = useState<string | ''>('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch users on component mount
  useState(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getUsers();
        setUsers(response);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category || !priority) {
      alert('Prosím vyplňte všetky povinné polia');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.createTask({
        title,
        description,
        category: category as TaskCategory,
        priority: priority as TaskPriority,
        status: TaskStatus.PENDING,
        assigneeId: assigneeId || undefined,
        progress: 0
      });
      
      router.push('/tasks');
      router.refresh();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Nepodarilo sa vytvoriť úlohu. Skúste to znova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Vytvoriť novú úlohu</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Nová úloha</CardTitle>
          <CardDescription>Vyplňte detaily novej úlohy</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Názov úlohy *</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Zadajte názov úlohy"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Popis úlohy *</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Zadajte popis úlohy"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategória *</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => setCategory(value as TaskCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kategóriu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskCategory.FINANCIAL}>Finančné</SelectItem>
                    <SelectItem value={TaskCategory.REPORTING}>Reporting</SelectItem>
                    <SelectItem value={TaskCategory.COMPLIANCE}>Compliance</SelectItem>
                    <SelectItem value={TaskCategory.PROCUREMENT}>Obstarávanie</SelectItem>
                    <SelectItem value={TaskCategory.TECHNICAL}>Technické</SelectItem>
                    <SelectItem value={TaskCategory.ADMINISTRATIVE}>Administratívne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priorita *</Label>
                <Select 
                  value={priority} 
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte prioritu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskPriority.LOW}>Nízka</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>Stredná</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>Vysoká</SelectItem>
                    <SelectItem value={TaskPriority.CRITICAL}>Kritická</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignee">Priradiť používateľovi</Label>
              <Select 
                value={assigneeId} 
                onValueChange={(value) => setAssigneeId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte používateľa" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Zrušiť
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Vytváranie...' : 'Vytvoriť úlohu'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

