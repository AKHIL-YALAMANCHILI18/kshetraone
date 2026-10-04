'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit2, 
  X,
  AlertCircle,
  Filter,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { FarmTask } from '@/types';

export default function TasksPage() {
  const { 
    tasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion, 
    cropCycles, 
    animals, 
    showToast 
  } = useFarmer();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<FarmTask | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FarmTask['category']>('crop');
  const [dueTime, setDueTime] = useState('Today 10:00 AM');
  const [priority, setPriority] = useState<FarmTask['priority']>('medium');
  const [sourceAssociation, setSourceAssociation] = useState<string>('');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('crop');
    setDueTime('Today 04:00 PM');
    setPriority('medium');
    setSourceAssociation(cropCycles[0]?.cropName || 'Maize');
    setFormError('');
    setShowTaskModal(true);
  };

  const openEditModal = (task: FarmTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setDueTime(task.dueTime);
    setPriority(task.priority);
    setSourceAssociation(task.sourceModule || '');
    setFormError('');
    setShowTaskModal(true);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a task title.');
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        category,
        dueTime,
        priority,
        sourceModule: sourceAssociation || editingTask.sourceModule,
      });
    } else {
      createTask({
        title: title.trim(),
        category,
        dueTime,
        priority,
        completed: false,
        sourceModule: sourceAssociation || 'Daily Tasks',
      });
    }

    setShowTaskModal(false);
  };

  // Filter logic
  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'pending' && t.completed) return false;
    if (activeFilter === 'completed' && !t.completed) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  const categoryIcons: Record<string, string> = {
    crop: '🌾',
    dairy: '🐄',
    finance: '💰',
    warehouse: '📦',
    general: '📌',
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9F6] text-stone-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 rounded-lg hover:bg-emerald-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black">Farm Tasks &amp; Schedule</h1>
        </div>

        <button 
          onClick={openCreateModal}
          className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </header>

      {/* BODY CONTENT */}
      <div className="p-3.5 space-y-3.5">
        
        {/* PROGRESS METRICS CARD */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Today&apos;s Execution</p>
              <h2 className="text-xl font-black text-stone-900 mt-0.5">
                {completedCount} of {tasks.length} Completed
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {pendingCount} Pending
            </span>
          </div>

          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-300" 
              style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* STATUS SUB-TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-2xl text-xs font-bold">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeFilter === 'all' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            All ({tasks.length})
          </button>
          <button 
            onClick={() => setActiveFilter('pending')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeFilter === 'pending' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            Pending ({pendingCount})
          </button>
          <button 
            onClick={() => setActiveFilter('completed')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${activeFilter === 'completed' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'}`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'crop', 'dairy', 'finance', 'warehouse', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              <span className="capitalize">{cat === 'all' ? 'All Modules' : `${cat} Tasks`}</span>
            </button>
          ))}
        </div>

        {/* TASKS LIST */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
              No tasks found under this filter. Tap &quot;New Task&quot; above to schedule one.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id}
                className={`p-3.5 bg-white rounded-2xl border shadow-2xs flex items-center justify-between transition-all ${
                  task.completed ? 'border-stone-200 bg-stone-50/50 opacity-80' : 'border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="shrink-0 p-1 hover:scale-110 active:scale-90 transition-transform"
                    title={task.completed ? 'Mark pending' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 hover:text-emerald-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-tight ${task.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500 flex-wrap">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{task.dueTime}</span>
                      </span>
                      <span className="capitalize text-stone-600 font-semibold bg-stone-100 px-1.5 py-0.2 rounded">
                        {categoryIcons[task.category] || '📌'} {task.category}
                      </span>
                      {task.priority === 'high' && (
                        <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-stone-100 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM TRIGGER */}
        <button 
          onClick={openCreateModal}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>

      </div>

      {/* ================= MODAL: CREATE / EDIT TASK ================= */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-base text-stone-900">
                {editingTask ? 'Edit Farm Task' : 'Schedule Farm Task'}
              </h2>
              <button onClick={() => setShowTaskModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Apply foliar spray on Maize Plot 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="crop">Crop / Farm</option>
                    <option value="dairy">Dairy / Animal</option>
                    <option value="finance">Finance</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-11 px-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Due Time / Target</label>
                <input
                  type="text"
                  placeholder="e.g. Today 04:00 PM / In 2 days"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Associated Enterprise</label>
                <select
                  value={sourceAssociation}
                  onChange={(e) => setSourceAssociation(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  <option value="Daily Routine">Daily Routine</option>
                  {cropCycles.map(c => (
                    <option key={c.id} value={c.cropName}>Crop: {c.cropName} ({c.variety})</option>
                  ))}
                  {animals.map(a => (
                    <option key={a.id} value={`Animal Tag #${a.tagNumber}`}>Animal: Tag #{a.tagNumber} ({a.breed})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
                >
                  {editingTask ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
