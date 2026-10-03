from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_data = UserSerializer(user).data
            return Response(
                {
                    "message": "User registered successfully.",
                    "user": response_data,
                    "approval_status": user.approval_status,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserManagementView(APIView):
    """
    Endpoint for Disaster Managers to list and manage department personnel.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Allow SUPERADMIN or OFFICIAL users to query directory
        users = User.objects.all().order_by("-date_joined")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserApprovalActionView(APIView):
    """
    Endpoint to approve, reject, or reassign a user's role.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")  # "APPROVE", "REJECT", "UPDATE_ROLE"
        if action == "APPROVE":
            target_user.approval_status = User.ApprovalStatus.APPROVED
            if "role" in request.data:
                target_user.role = request.data["role"]
            target_user.save()
            return Response({"message": f"User {target_user.username} approved successfully."})
        elif action == "REJECT":
            target_user.approval_status = User.ApprovalStatus.REJECTED
            target_user.save()
            return Response({"message": f"User {target_user.username} rejected."})
        elif action == "UPDATE_ROLE":
            new_role = request.data.get("role")
            if new_role in User.Role.values:
                target_user.role = new_role
                target_user.save()
                return Response({"message": f"Role updated to {new_role}."})
            return Response({"error": "Invalid role value."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Invalid action specified."}, status=status.HTTP_400_BAD_REQUEST)
