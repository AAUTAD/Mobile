"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { personSchema, type Person } from "~/schemas/person-schema";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import MultipleSelector, { type Option } from "./ui/selector";
import { type Sport } from "~/schemas/sport-schema";

interface PersonFormProps {
  person?: Person & { sports?: { id: string; name?: string }[] };
  handleSuccess?: () => void;
}

export function PersonForm({ person, handleSuccess }: PersonFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();

  const { data: sportsData, isLoading: isLoadingSports } = api.sport.getAll.useQuery();

  const sportOptions: Option[] = sportsData?.map(sport => ({
    value: sport.id,
    label: sport.name,
  })) ?? [];

  const form = useForm<Person>({
    resolver: zodResolver(personSchema),
    defaultValues: person
      ? {
          ...person,
          sports: person.sports?.map(s => ({ id: s.id })) ?? [],
        }
      : {
          name: "",
          contact: "",
          email: "",
          role: "",
          sports: [],
        },
  });

  useEffect(() => {
    if (person) {
      form.reset({
        ...person,
        sports: person.sports?.map(s => ({ id: s.id })) ?? [],
      });
    } else {
      form.reset({
        name: "",
        contact: "",
        email: "",
        role: "",
        sports: [],
      });
    }
  }, [person, form.reset, form]);

  const createPersonMutation = api.person.create.useMutation({
    onSuccess: async () => {
      setIsSubmitting(false);
      await utils.person.getAll.invalidate();
      toast.success("Person created successfully!");
      handleSuccess?.();
      router.push("/pessoas");
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error("Error creating person: " + error.message);
    },
  });

  const editPersonMutation = api.person.edit.useMutation({
    onSuccess: async () => {
      setIsSubmitting(false);
      await utils.person.getAll.invalidate();
      toast.success("Person updated successfully!");
      handleSuccess?.();
      router.push("/pessoas");
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error("Error updating person: " + error.message);
    },
  });

  async function onSubmit(data: Person) {
    setIsSubmitting(true);
    const submissionData = {
      ...data,
      sports: data.sports?.map(s => ({ id: s.id })) ?? [],
    };

    if (person?.id) {
      editPersonMutation.mutate({
        id: person.id,
        ...submissionData,
      });
    } else {
      createPersonMutation.mutate(submissionData);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          toast.error("Please check the form for errors.");
          setIsSubmitting(false);
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <Input placeholder="Contact" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="Role" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sports"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sports</FormLabel>
              <FormControl>
                <MultipleSelector
                  value={field.value?.map(s => ({
                    value: s.id,
                    label: sportsData?.find(sd => sd.id === s.id)?.name ?? s.id,
                  }))}
                  onChange={(options: Option[]) => field.onChange(options.map(option => ({ id: option.value })))}
                  options={sportOptions}
                  placeholder="Select sports..."
                  disabled={isLoadingSports}
                  emptyIndicator={<p>No sports found.</p>}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || isLoadingSports}>
          {isSubmitting ? "Submitting..." : person ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
}
