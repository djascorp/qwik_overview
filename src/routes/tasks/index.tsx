import { QwikChangeEvent, component$, useSignal,$, QwikMouseEvent, QRL } from "@builder.io/qwik";
import { RequestHandler, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { PrismaClient, Task } from "@prisma/client";

export const useTask = routeLoader$(async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();
    const tasks = await prisma.task.findMany();
    await prisma.$disconnect();
    return tasks;
});

export const useAddTask = routeAction$(async (data) => {
    const prisma = new PrismaClient();
    await prisma.$connect();
    const task = data as Partial<Task>
    await prisma.task.create({
        data: {
            title: task.title!,
            description: task.description,
        }
    });
    await prisma.$disconnect();
});
export const useRemoveTask = routeAction$(async (data) => {
    const prisma = new PrismaClient();
    await prisma.$connect();
    const task = data as Partial<Task>
    await prisma.task.delete({
        where: {id: task.id}
    });
    await prisma.$disconnect();
});

const TaskRow = ({task,onClick$}: {task: Task, onClick$: QRL}
) => (
    <tr>
        <td>{task.title}</td>
        <td>{task.description}</td>
        <td>
            <button onClick$={onClick$}>x</button>
        </td>
    </tr>
);

export const onRequest: RequestHandler =async ({ params }) => {
    console.log("Requettes ",params);
}

export default component$(() => {
    let x = useTask();
    let taskTitle = useSignal("");

    const onChangeTitle = $((e: QwikChangeEvent<HTMLInputElement>) => {
        taskTitle.value=e.target.value;
    });

    const addTaskAction = useAddTask();
    const removeTaskAction = useRemoveTask();

    const onAddTask = $(() => {
        addTaskAction.submit({title: taskTitle.value, description: ""});
    })
    const onRemoveTask = $((task: Task) => {
        removeTaskAction.submit({id: task.id});
    });
    
     
    return (
        <div>
            <table class="w-100">
                <thead>
                    <th class=" p-2" colSpan={3}>Liste des taches</th>
                </thead>
                <tbody>
                {x.value.map(task => <TaskRow task={task} onClick$={$(() => onRemoveTask(task))}  />)}
                </tbody>
               
            </table>

            <div class="flex flex-col gap-1 w-1/2 py-3">
                <label class="text-2xl text-center">Ajouter Tache</label>
                <input class="text-black outline-none rounded-sm py-3 px-2 ring-1 focus:border-blue-600 focus:text-blue-600 focus:font-semibold" type="text" name="title" value={taskTitle.value} onChange$={onChangeTitle}  />
                <button class="p-2 bg-slate-500" onClick$={onAddTask}>
                    Ajouter
                </button>
            </div>
        </div>
    )
})