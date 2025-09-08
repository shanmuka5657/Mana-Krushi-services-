
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['owner', 'passenger'], { required_error: 'Please select a role.' }),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  vehicleType: z.string().optional(),
  availableSeats: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role === 'owner') {
        if (!data.fromLocation || data.fromLocation.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['fromLocation'],
                message: 'From location is required.',
            });
        }
        if (!data.toLocation || data.toLocation.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['toLocation'],
                message: 'To location is required.',
            });
        }
        if (!data.departureTime) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['departureTime'],
                message: 'Departure time is required.',
            });
        }
        if (!data.arrivalTime) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['arrivalTime'],
                message: 'Arrival time is required.',
            });
        }
        if (!data.vehicleType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['vehicleType'],
                message: 'Vehicle type is required.',
            });
        }
        if (!data.availableSeats) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['availableSeats'],
                message: 'Available seats is required.',
            });
        }
    }
});


export function SignupForm() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      fromLocation: '',
      toLocation: '',
      departureTime: '09:00',
      arrivalTime: '18:00',
      availableSeats: '1',
    },
  });

  const role = form.watch('role');

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Final submission:', values);
    // Here you would typically handle the signup logic
    setShowConfirmation(false);
    // For now, let's redirect to the login page after "signup"
    router.push('/login');
  }

  return (
    <>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => setShowConfirmation(true))} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
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
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="passenger">Passenger</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === 'owner' && (
                 <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">Owner Details</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="fromLocation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., New York" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="toLocation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Boston" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="departureTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Departure Time</FormLabel>
                                     <FormControl>
                                      <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input type="time" className="pl-10" {...field} />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="arrivalTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Arrival Time</FormLabel>
                                     <FormControl>
                                      <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input type="time" className="pl-10" {...field} />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="vehicleType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Vehicle Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vehicle type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="car">Car</SelectItem>
                                    <SelectItem value="bus">Bus</SelectItem>
                                    <SelectItem value="van">Van</SelectItem>
                                    <SelectItem value="suv">SUV</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="availableSeats"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Available Seats</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select number of seats" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="6+">6+</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm that the details you entered are correct before creating your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
