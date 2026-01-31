
import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, PlusCircle, Trash2, Loader2, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const subjectSchema = z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    teacher: z.string().optional(),
    teacherId: z.string().optional(),
    book: z.string().optional(),
});

const addSubjectSchema = z.object({
    // Fix: replaced z.string({ required_error: ... }) with .min(1, ...) to avoid type mismatch in different Zod versions
    grade: z.string().min(1, "Please select a class."),
    subjects: z.array(subjectSchema).min(1),
}).refine(data => data.subjects.some(s => s.name && s.name.length > 0), {
    message: "At least one subject name is required.",
    path: ["subjects"],
});

type AddSubjectFormValues = z.infer<typeof addSubjectSchema>;

interface AddSubjectFormBatchProps {
    onBack: () => void;
    onSubmit: (data: AddSubjectFormValues) => void;
    staff: { id: string, name: string }[];
    classes: string[];
}

export const AddSubjectFormBatch = ({ onBack, onSubmit, staff, classes }: AddSubjectFormBatchProps) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const form = useForm<AddSubjectFormValues>({
        resolver: zodResolver(addSubjectSchema),
        defaultValues: {
            grade: '',
            subjects: Array.from({ length: 5 }, () => ({ name: '', code: '', teacher: '', teacherId: '', book: '' })),
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "subjects",
    });

    const onFormSubmit = async (data: AddSubjectFormValues) => {
        setError(null);
        // Filter out subjects with no name
        const validSubjects = data.subjects.filter(s => s.name && s.name.trim() !== '');

        if (validSubjects.length === 0) {
            setError("Please enter at least one subject name.");
            return;
        }

        if (!data.grade) {
            setError("Please select a target class level.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ ...data, subjects: validSubjects });
        } catch (err) {
            setIsSubmitting(false);
            setError("An error occurred during submission.");
        }
    }

    const addMoreSubjects = () => {
        append({ name: '', code: '', teacher: '', teacherId: '', book: '' });
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Batch Subject Entry</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Multi-curriculum synchronization engine</p>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-indigo-100">
                        Institutional OS v2.5
                    </div>
                </div>
            </div>

            <div className="p-8">
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                        <Info size={18} />
                        <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                    </div>
                )}

                <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-10">
                    <div className="max-w-md">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Class Target Level</label>
                        <select 
                            {...form.register("grade")}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                        >
                            <option value="">Select Level</option>
                            {classes.map((cls) => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>

                    <div className="border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm bg-white">
                        <div className="grid grid-cols-[1.5fr,120px,1.2fr,1.2fr,50px] gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Name</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Code</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Textbook</div>
                            <div></div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[1.5fr,120px,1.2fr,1.2fr,50px] gap-4 px-8 py-4 items-center hover:bg-indigo-50/30 transition-colors">
                                    <div>
                                        <input
                                            {...form.register(`subjects.${index}.name` as const)}
                                            placeholder="e.g. Mathematics"
                                            className="w-full bg-transparent border-none outline-none font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium text-sm"
                                            onChange={(e) => {
                                                const name = e.target.value;
                                                form.setValue(`subjects.${index}.name`, name);
                                                
                                                // Auto-generate code
                                                const currentCode = form.getValues(`subjects.${index}.code`);
                                                if (!currentCode || currentCode.length <= 4) {
                                                    const words = name.trim().split(/\s+/);
                                                    let generated = '';
                                                    if (name.trim().length >= 2) {
                                                        if (words.length === 1) {
                                                            generated = name.trim().substring(0, 4).toUpperCase();
                                                        } else {
                                                            generated = words.map(w => w.charAt(0)).join('').toUpperCase().substring(0, 4);
                                                        }
                                                        form.setValue(`subjects.${index}.code`, generated);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            {...form.register(`subjects.${index}.code` as const)}
                                            placeholder="MATH"
                                            className="w-full bg-transparent border-none outline-none font-mono font-black text-xs text-indigo-600 placeholder:text-slate-300 tracking-widest"
                                            onChange={(e) => form.setValue(`subjects.${index}.code`, e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <div>
                                        <select 
                                            {...form.register(`subjects.${index}.teacherId` as const)}
                                            className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-700 cursor-pointer"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                form.setValue(`subjects.${index}.teacherId`, val);
                                                const teacherName = staff.find(s => s.id === val)?.name || '';
                                                form.setValue(`subjects.${index}.teacher`, teacherName);
                                            }}
                                        >
                                            <option value="">Select</option>
                                            {staff.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <input
                                            {...form.register(`subjects.${index}.book` as const)}
                                            placeholder="e.g. Science Vol 1"
                                            className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-500 placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            disabled={fields.length <= 1}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={addMoreSubjects}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-dashed border-indigo-200 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                        >
                            <PlusCircle size={18} /> Add Subject Row
                        </button>
                        
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button 
                                type="button" 
                                onClick={onBack} 
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-initial px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="flex-1 sm:flex-initial px-12 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync Curriculum"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
